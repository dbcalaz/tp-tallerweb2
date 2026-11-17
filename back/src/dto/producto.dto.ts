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

export class GuardarProductoAdminDto {
    constructor(
        public readonly nombre: string,
        public readonly descripcion: string,
        public readonly precio: number,
        public readonly stock: number,
        public readonly imagenUrl: string | null,
        public readonly marcaId: number,
        public readonly tipoProductoId: number,
        public readonly activo: boolean,
    ) {}

    static fromBody(body: unknown): GuardarProductoAdminDto {
        const raw = (body ?? {}) as Record<string, unknown>;
        const nombre = typeof raw.nombre === "string" ? raw.nombre.trim() : "";
        const descripcion = typeof raw.descripcion === "string" ? raw.descripcion.trim() : "";
        const precio = Number(raw.precio);
        const stock = Number(raw.stock);
        const marcaId = Number(raw.marcaId);
        const tipoProductoId = Number(raw.tipoProductoId);
        const imagenUrl = raw.imagenUrl == null ? null : raw.imagenUrl;
        const activo = typeof raw.activo === "boolean" ? raw.activo : true;
        const errors: Record<string, string> = {};
        if (!nombre || nombre.length > 120) errors.nombre = "El nombre es obligatorio y admite hasta 120 caracteres.";
        if (!Number.isFinite(precio) || precio <= 0) errors.precio = "Ingresá un precio mayor a cero.";
        if (!Number.isInteger(stock) || stock < 0) errors.stock = "El stock debe ser un número entero igual o mayor a cero.";
        if (!Number.isInteger(marcaId) || marcaId < 1) errors.marcaId = "Seleccioná una marca.";
        if (!Number.isInteger(tipoProductoId) || tipoProductoId < 1) errors.tipoProductoId = "Seleccioná un tipo de producto.";
        if (imagenUrl !== null && (typeof imagenUrl !== "string" || imagenUrl.length > 7_000_000 || !(/^https?:\/\//i.test(imagenUrl) || /^data:image\/(png|jpeg|webp|gif);base64,/i.test(imagenUrl)))) errors.imagenUrl = "La imagen debe ser PNG, JPG, GIF o WebP de hasta 5 MB.";
        if (Object.keys(errors).length) throw new BadRequestError("Revisá los campos del producto.", errors);
        return new GuardarProductoAdminDto(nombre, descripcion, precio, stock, imagenUrl as string | null, marcaId, tipoProductoId, activo);
    }
}

