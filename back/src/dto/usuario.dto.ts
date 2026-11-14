import { BadRequestError } from "../errors/http.error.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isComplexPassword(password: string): boolean {
    return password.length >= 8
        && /[a-z]/.test(password)
        && /[A-Z]/.test(password)
        && /\d/.test(password)
        && /[^A-Za-z0-9]/.test(password);
}

export class RegistroUsuarioDto {
    constructor(
        public readonly email: string,
        public readonly password: string,
        public readonly nombre: string,
        public readonly apellido: string,
        public readonly direccion: string,
    ) {}

    static fromBody(body: unknown): RegistroUsuarioDto {
        const raw = (body ?? {}) as Record<string, unknown>;
        const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
        const password = typeof raw.password === "string" ? raw.password : "";
        const nombre = typeof raw.nombre === "string" ? raw.nombre.trim() : "";
        const apellido = typeof raw.apellido === "string" ? raw.apellido.trim() : "";
        const direccion = typeof raw.direccion === "string" ? raw.direccion.trim() : "";

        const fieldErrors: Record<string, string> = {};
        if (!email) fieldErrors.email = "Ingresá tu email.";
        else if (!EMAIL_PATTERN.test(email)) fieldErrors.email = "Ingresá un email con formato válido.";

        if (!password) fieldErrors.password = "Ingresá una contraseña.";
        else if (!isComplexPassword(password)) {
            fieldErrors.password = "Usá al menos 8 caracteres e incluí mayúscula, minúscula, número y símbolo.";
        }

        if (!nombre) fieldErrors.nombre = "Ingresá tu nombre.";
        if (!apellido) fieldErrors.apellido = "Ingresá tu apellido.";
        if (!direccion) fieldErrors.direccion = "Ingresá tu dirección.";

        if (Object.keys(fieldErrors).length > 0) {
            throw new BadRequestError("Revisá los campos marcados.", fieldErrors);
        }

        return new RegistroUsuarioDto(email, password, nombre, apellido, direccion);
    }
}

export class LoginUsuarioDto {
    constructor(
        public readonly email: string,
        public readonly password: string,
    ) {}

    static fromBody(body: unknown): LoginUsuarioDto {
        const raw = (body ?? {}) as Record<string, unknown>;
        const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
        const password = typeof raw.password === "string" ? raw.password : "";

        if (!EMAIL_PATTERN.test(email) || !password) {
            throw new BadRequestError("Ingresá un email válido y tu contraseña.");
        }

        return new LoginUsuarioDto(email, password);
    }
}

export class ActualizarPerfilDto {
    constructor(
        public readonly nombre: string,
        public readonly apellido: string,
        public readonly direccion: string,
    ) {}

    static fromBody(body: unknown): ActualizarPerfilDto {
        const raw = (body ?? {}) as Record<string, unknown>;
        const nombre = typeof raw.nombre === "string" ? raw.nombre.trim() : "";
        const apellido = typeof raw.apellido === "string" ? raw.apellido.trim() : "";
        const direccion = typeof raw.direccion === "string" ? raw.direccion.trim() : "";

        if (!nombre || !apellido || !direccion) {
            throw new BadRequestError("Todos los campos son obligatorios.");
        }

        return new ActualizarPerfilDto(nombre, apellido, direccion);
    }
}

export class UsuarioResponseDto {
    constructor(
        public readonly id: number,
        public readonly email: string,
        public readonly nombre: string,
        public readonly apellido: string,
        public readonly direccion?: string,
        public readonly createdAt?: Date,
    ) {}

    static fromEntity(user: {
        id: number;
        email: string;
        nombre: string;
        apellido: string;
        direccion?: string;
        createdAt?: Date;
    }): UsuarioResponseDto {
        return new UsuarioResponseDto(
            user.id,
            user.email,
            user.nombre,
            user.apellido,
            user.direccion,
            user.createdAt,
        );
    }
}

export class DetalleCompraResponseDto {
    constructor(
        public readonly id: number,
        public readonly compraId: number,
        public readonly productoId: number,
        public readonly cantidad: number,
        public readonly precioUnitario: number,
        public readonly producto: {
            id: number;
            nombre: string;
            imagenUrl: string | null;
            precio: number;
        },
    ) {}

    static fromEntity(detalle: {
        id: number;
        compraId: number;
        productoId: number;
        cantidad: number;
        precioUnitario: unknown;
        producto: {
            id: number;
            nombre: string;
            imagenUrl: string | null;
            precio: unknown;
        };
    }): DetalleCompraResponseDto {
        return new DetalleCompraResponseDto(
            detalle.id,
            detalle.compraId,
            detalle.productoId,
            detalle.cantidad,
            Number(detalle.precioUnitario),
            {
                id: detalle.producto.id,
                nombre: detalle.producto.nombre,
                imagenUrl: detalle.producto.imagenUrl,
                precio: Number(detalle.producto.precio),
            },
        );
    }
}

export class CompraResponseDto {
    constructor(
        public readonly id: number,
        public readonly userId: number,
        public readonly total: number,
        public readonly estado: string,
        public readonly direccionEnvio: string | null,
        public readonly createdAt: Date,
        public readonly detalles: DetalleCompraResponseDto[],
    ) {}

    static fromEntity(compra: {
        id: number;
        userId: number;
        total: unknown;
        estado: string;
        direccionEnvio: string | null;
        createdAt: Date;
        detalles: Array<Parameters<typeof DetalleCompraResponseDto.fromEntity>[0]>;
    }): CompraResponseDto {
        return new CompraResponseDto(
            compra.id,
            compra.userId,
            Number(compra.total),
            compra.estado,
            compra.direccionEnvio,
            compra.createdAt,
            compra.detalles.map((d) => DetalleCompraResponseDto.fromEntity(d)),
        );
    }
}

export class PerfilUsuarioResponseDto {
    constructor(
        public readonly id: number,
        public readonly email: string,
        public readonly nombre: string,
        public readonly apellido: string,
        public readonly direccion: string,
        public readonly createdAt: Date,
        public readonly compras: CompraResponseDto[],
    ) {}

    static fromEntity(user: {
        id: number;
        email: string;
        nombre: string;
        apellido: string;
        direccion: string;
        createdAt: Date;
        compras: Array<Parameters<typeof CompraResponseDto.fromEntity>[0]>;
    }): PerfilUsuarioResponseDto {
        return new PerfilUsuarioResponseDto(
            user.id,
            user.email,
            user.nombre,
            user.apellido,
            user.direccion,
            user.createdAt,
            user.compras.map((c) => CompraResponseDto.fromEntity(c)),
        );
    }
}

