import { BadRequestError } from "../errors/http.error.js";

export class FiltroProductoDto {
    constructor(public readonly busqueda?: string) { }

    static fromQuery(query: Record<string, unknown>): FiltroProductoDto {
        const busqueda = typeof query.busqueda === "string" && query.busqueda.trim()
            ? query.busqueda.trim()
            : undefined;

        return new FiltroProductoDto(busqueda);
    }
}

export class FiltroProductoAdminDto {
    constructor(
        public readonly busqueda: string | undefined,
        public readonly categoriaId: number | undefined,
        public readonly tipoProductoId: number | undefined,
        public readonly activo: boolean | undefined,
        public readonly pagina: number,
        public readonly limite: number,
    ) { }

    static fromQuery(query: Record<string, unknown>): FiltroProductoAdminDto {
        const texto = (valor: unknown) => (typeof valor === "string" ? valor.trim() : "");
        const entero = (valor: unknown) => {
            const n = Number(texto(valor));
            return Number.isInteger(n) && n > 0 ? n : undefined;
        };

        const estado = texto(query.estado);
        const activo = estado === "activos" ? true : estado === "inactivos" ? false : undefined;

        return new FiltroProductoAdminDto(
            texto(query.busqueda) || undefined,
            entero(query.categoriaId),
            entero(query.tipoProductoId),
            activo,
            entero(query.pagina) ?? 1,
            Math.min(entero(query.limite) ?? 12, 50),
        );
    }
}

export class ProductoResponseDto {
    constructor(
        public readonly id: number,
        public readonly nombre: string,
        public readonly descripcion: string | null,
        public readonly precio: number,
        public readonly stock: number,
        public readonly imagenUrl: string | null,
        public readonly marcaId: number,
        public readonly tipoProductoId: number,
        public readonly marca: { id: number; nombre: string },
        public readonly tipoProducto: {
            id: number;
            nombre: string;
            categoriaId: number;
            categoria: { id: number; nombre: string; imagenUrl: string | null };
        },
        public readonly activo: boolean,
    ) { }

    static fromEntity(producto: {
        id: number;
        nombre: string;
        descripcion: string | null;
        precio: unknown;
        stock: number;
        imagenUrl: string | null;
        marcaId: number;
        tipoProductoId: number;
        marca: { id: number; nombre: string };
        tipoProducto: {
            id: number;
            nombre: string;
            categoriaId: number;
            categoria: { id: number; nombre: string; imagenUrl: string | null };
        };
        activo: boolean;
    }): ProductoResponseDto {
        return new ProductoResponseDto(
            producto.id,
            producto.nombre,
            producto.descripcion,
            Number(producto.precio),
            producto.stock,
            producto.imagenUrl,
            producto.marcaId,
            producto.tipoProductoId,
            {
                id: producto.marca.id,
                nombre: producto.marca.nombre,
            },
            {
                id: producto.tipoProducto.id,
                nombre: producto.tipoProducto.nombre,
                categoriaId: producto.tipoProducto.categoriaId,
                categoria: {
                    id: producto.tipoProducto.categoria.id,
                    nombre: producto.tipoProducto.categoria.nombre,
                    imagenUrl: producto.tipoProducto.categoria.imagenUrl,
                },
            },
            producto.activo,
        );
    }

    static fromEntityList(productos: Array<Parameters<typeof ProductoResponseDto.fromEntity>[0]>): ProductoResponseDto[] {
        return productos.map((p) => ProductoResponseDto.fromEntity(p));
    }
}

export class ActualizarActivoDto {
    constructor(public readonly activo: boolean) { }

    static fromBody(body: unknown): ActualizarActivoDto {
        const raw = (body ?? {}) as Record<string, unknown>;
        if (typeof raw.activo !== "boolean") {
            throw new BadRequestError("Indicá si el producto queda activo o no.");
        }
        return new ActualizarActivoDto(raw.activo);
    }
}

