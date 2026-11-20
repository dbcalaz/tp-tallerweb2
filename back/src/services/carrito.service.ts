import { MercadoPagoConfig, Payment } from "mercadopago";
import {
    ActualizarCantidadDto,
    AgregarItemCarritoDto,
    CarritoResponseDto,
    CheckoutDto,
    CheckoutResponseDto,
} from "../dto/carrito.dto.js";
import { CompraResponseDto } from "../dto/usuario.dto.js";
import { BadRequestError, NotFoundError } from "../errors/http.error.js";
import type { CarritoRepository } from "../repository/carrito.repository.js";
import { EmailService } from "./email.service.js";

export class CarritoService {
    private readonly emailService = new EmailService();

    constructor(private readonly carritoRepository: CarritoRepository) { }

    async obtenerCarrito(userId: number): Promise<CarritoResponseDto> {
        const carrito = await this.carritoRepository.findByUserId(userId);
        if (!carrito) {
            return new CarritoResponseDto(0, userId, []);
        }
        return CarritoResponseDto.fromEntity(carrito);
    }

    async agregarItem(userId: number, dto: AgregarItemCarritoDto): Promise<CarritoResponseDto> {
        const producto = await this.carritoRepository.findProductoActivo(dto.productoId);
        if (!producto) {
            throw new NotFoundError("El producto no existe o no está disponible.");
        }

        const carrito = await this.carritoRepository.findOrCreateByUserId(userId);
        const itemExistente = carrito.items.find((item) => item.productoId === dto.productoId);
        const cantidadActual = itemExistente?.cantidad ?? 0;
        const cantidadResultante = cantidadActual + dto.cantidad;

        if (cantidadResultante > producto.stock) {
            const disponible = Math.max(0, producto.stock - cantidadActual);
            throw new BadRequestError(
                `Stock insuficiente para "${producto.nombre}". Solo hay ${disponible} unidad${disponible === 1 ? "" : "es"} disponible${disponible === 1 ? "" : "s"}.`,
            );
        }

        await this.carritoRepository.upsertItem(carrito.id, dto.productoId, dto.cantidad);

        const updated = await this.carritoRepository.findOrCreateByUserId(userId);
        return CarritoResponseDto.fromEntity(updated);
    }

    async actualizarCantidad(userId: number, productoId: number, dto: ActualizarCantidadDto): Promise<CarritoResponseDto> {
        if (dto.cantidad > 0) {
            const producto = await this.carritoRepository.findProductoActivo(productoId);
            if (!producto) {
                throw new NotFoundError("El producto no existe o no está disponible.");
            }
            if (dto.cantidad > producto.stock) {
                throw new BadRequestError(
                    `Stock insuficiente para "${producto.nombre}". El máximo disponible es ${producto.stock} unidad${producto.stock === 1 ? "" : "es"}.`,
                );
            }
        }

        const carrito = await this.carritoRepository.findOrCreateByUserId(userId);
        await this.carritoRepository.updateItemQuantity(carrito.id, productoId, dto.cantidad);

        const updated = await this.carritoRepository.findOrCreateByUserId(userId);
        return CarritoResponseDto.fromEntity(updated);
    }

    async removerItem(userId: number, productoId: number): Promise<CarritoResponseDto> {
        const carrito = await this.carritoRepository.findOrCreateByUserId(userId);
        await this.carritoRepository.removeItem(carrito.id, productoId);

        const updated = await this.carritoRepository.findOrCreateByUserId(userId);
        return CarritoResponseDto.fromEntity(updated);
    }

    async vaciarCarrito(userId: number): Promise<CarritoResponseDto> {
        const carrito = await this.carritoRepository.findOrCreateByUserId(userId);
        await this.carritoRepository.clearItems(carrito.id);

        const updated = await this.carritoRepository.findOrCreateByUserId(userId);
        return CarritoResponseDto.fromEntity(updated);
    }

    async checkout(userId: number, dto: CheckoutDto): Promise<CheckoutResponseDto> {
        const user = await this.carritoRepository.findUserById(userId);
        if (!user) {
            throw new NotFoundError("Usuario no encontrado.");
        }

        const carrito = await this.carritoRepository.findOrCreateByUserId(userId);
        if (carrito.items.length === 0) {
            throw new BadRequestError("El carrito está vacío.");
        }

        const inactivo = carrito.items.find((item) => {
            const p = item.producto;
            return !p.activo || !p.marca.activo || !p.tipoProducto.activo || !p.tipoProducto.categoria.activo;
        });
        if (inactivo) {
            throw new BadRequestError(
                `"${inactivo.producto.nombre}" ya no está disponible. Quitalo del carrito para continuar.`,
            );
        }

        const stockInsuficiente = carrito.items.find((item) => item.producto.stock < item.cantidad);
        if (stockInsuficiente) {
            throw new BadRequestError(
                `Stock insuficiente para "${stockInsuficiente.producto.nombre}". Solo hay ${stockInsuficiente.producto.stock} unidad${stockInsuficiente.producto.stock === 1 ? "" : "es"} disponible${stockInsuficiente.producto.stock === 1 ? "" : "s"}.`,
            );
        }

        const total = carrito.items.reduce(
            (acc, item) => acc + Number(item.producto.precio) * item.cantidad,
            0,
        );

        const accessToken = process.env.MP_ACCESS_TOKEN;
        if (!accessToken) {
            throw new BadRequestError("MP_ACCESS_TOKEN no configurado en el servidor.");
        }

        const client = new MercadoPagoConfig({ accessToken });
        const payment = new Payment(client);

        const paymentData: any = {
            transaction_amount: Number(total.toFixed(2)),
            token: dto.token!,
            description: "Compra en Tecnova",
            installments: Number(dto.installments) || 1,
            payment_method_id: dto.paymentMethodId!,
            payer: {
                email: dto.payerEmail!,
                identification: {
                    type: dto.identificationType || "DNI",
                    number: dto.identificationNumber!,
                },
            },
        };

        if (dto.issuerId) {
            const issuerIdNum = Number(dto.issuerId);
            if (!isNaN(issuerIdNum) && issuerIdNum > 0) {
                paymentData.issuer_id = issuerIdNum;
            }
        }

        let mpPayment;
        try {
            mpPayment = await payment.create({ body: paymentData });
        } catch (mpError: any) {
            console.error('Error Mercado Pago:', JSON.stringify(mpError, null, 2));
            const errorMessage = mpError?.cause?.[0]?.description || mpError?.message || 'Error al procesar el pago con Mercado Pago';
            throw new BadRequestError(errorMessage);
        }

        if (mpPayment.status !== "approved") {
            const statusDetail = mpPayment.status_detail || "Rechazado";
            throw new BadRequestError(
                `El pago fue ${statusDetail}. Por favor, verificá los datos e intentá nuevamente.`,
            );
        }

        const compra = await this.carritoRepository.executeCheckoutTransaction({
            userId,
            carritoId: carrito.id,
            total,
            direccionEnvio: dto.direccionEnvio ?? user.direccion,
            items: carrito.items.map((item) => ({
                productoId: item.productoId,
                cantidad: item.cantidad,
                precioUnitario: item.producto.precio,
            })),
        });

        try {
            const orderId = `#AUS-${compra.id}`;
            const fechaCompra = new Date(compra.createdAt).toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
            const productos = carrito.items.map((item) => ({
                nombre: item.producto.nombre,
                cantidad: item.cantidad,
                subtotal: Number(item.producto.precio) * item.cantidad,
            }));
            const installments = Number(dto.installments) || 1;
            const direccionEnvio = dto.direccionEnvio ?? user.direccion;

            await this.emailService.enviarComprobanteCompra(
                dto.payerEmail!,
                `${user.nombre} ${user.apellido}`,
                orderId,
                fechaCompra,
                productos,
                installments,
                total,
                direccionEnvio,
            );
        } catch (emailError) {
            console.error('Error al enviar comprobante de compra:', emailError);
        }

        return new CheckoutResponseDto("¡Compra realizada con éxito!", CompraResponseDto.fromEntity(compra));
    }
}

