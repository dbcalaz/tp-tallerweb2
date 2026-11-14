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

export class CarritoService {
    constructor(private readonly carritoRepository: CarritoRepository) {}

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

        const total = carrito.items.reduce(
            (acc, item) => acc + Number(item.producto.precio) * item.cantidad,
            0,
        );

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

        return new CheckoutResponseDto("¡Compra realizada con éxito!", CompraResponseDto.fromEntity(compra));
    }
}

