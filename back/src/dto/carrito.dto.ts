import { BadRequestError } from "../errors/http.error.js";
import { CompraResponseDto } from "./usuario.dto.js";

export class AgregarItemCarritoDto {
    constructor(
        public readonly productoId: number,
        public readonly cantidad: number,
    ) {}

    static fromBody(body: unknown): AgregarItemCarritoDto {
        const raw = (body ?? {}) as Record<string, unknown>;
        const productoId = Number(raw.productoId);
        const cantidad = raw.cantidad === undefined ? 1 : Number(raw.cantidad);

        if (!Number.isInteger(productoId) || productoId <= 0 || !Number.isInteger(cantidad) || cantidad <= 0) {
            throw new BadRequestError("Datos inválidos para agregar producto.");
        }

        return new AgregarItemCarritoDto(productoId, cantidad);
    }
}

export class ActualizarCantidadDto {
    constructor(public readonly cantidad: number) {}

    static fromBody(body: unknown): ActualizarCantidadDto {
        const raw = (body ?? {}) as Record<string, unknown>;
        const cantidad = Number(raw.cantidad);

        if (Number.isNaN(cantidad) || !Number.isInteger(cantidad)) {
            throw new BadRequestError("La cantidad debe ser un número entero válido.");
        }

        return new ActualizarCantidadDto(cantidad);
    }
}

export class CheckoutDto {
    constructor(public readonly direccionEnvio?: string) {}

    static fromBody(body: unknown): CheckoutDto {
        const raw = (body ?? {}) as Record<string, unknown>;
        const direccionEnvio = typeof raw.direccionEnvio === "string" && raw.direccionEnvio.trim()
            ? raw.direccionEnvio.trim()
            : undefined;

        return new CheckoutDto(direccionEnvio);
    }
}

export class CarritoItemResponseDto {
    constructor(
        public readonly id: number,
        public readonly carritoId: number,
        public readonly productoId: number,
        public readonly cantidad: number,
        public readonly createdAt: Date,
        public readonly producto: {
            id: number;
            nombre: string;
            descripcion: string;
            precio: number;
            imagenUrl: string | null;
            stock: number;
            marca: { id: number; nombre: string };
            tipoProducto: { id: number; nombre: string };
        },
    ) {}

    static fromEntity(item: {
        id: number;
        carritoId: number;
        productoId: number;
        cantidad: number;
        createdAt: Date;
        producto: {
            id: number;
            nombre: string;
            descripcion: string;
            precio: unknown;
            imagenUrl: string | null;
            stock: number;
            marca: { id: number; nombre: string };
            tipoProducto: { id: number; nombre: string };
        };
    }): CarritoItemResponseDto {
        return new CarritoItemResponseDto(
            item.id,
            item.carritoId,
            item.productoId,
            item.cantidad,
            item.createdAt,
            {
                id: item.producto.id,
                nombre: item.producto.nombre,
                descripcion: item.producto.descripcion,
                precio: Number(item.producto.precio),
                imagenUrl: item.producto.imagenUrl,
                stock: item.producto.stock,
                marca: {
                    id: item.producto.marca.id,
                    nombre: item.producto.marca.nombre,
                },
                tipoProducto: {
                    id: item.producto.tipoProducto.id,
                    nombre: item.producto.tipoProducto.nombre,
                },
            },
        );
    }
}

export class CarritoResponseDto {
    constructor(
        public readonly id: number,
        public readonly userId: number,
        public readonly items: CarritoItemResponseDto[],
    ) {}

    static fromEntity(carrito: {
        id: number;
        userId: number;
        items: Array<Parameters<typeof CarritoItemResponseDto.fromEntity>[0]>;
    }): CarritoResponseDto {
        return new CarritoResponseDto(
            carrito.id,
            carrito.userId,
            carrito.items.map((item) => CarritoItemResponseDto.fromEntity(item)),
        );
    }
}

export class CheckoutResponseDto {
    constructor(
        public readonly message: string,
        public readonly compra: CompraResponseDto,
    ) {}
}

