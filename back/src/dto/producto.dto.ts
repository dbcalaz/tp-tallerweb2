export class FiltroProductoDto {
    constructor(public readonly busqueda?: string) {}

    static fromQuery(query: Record<string, unknown>): FiltroProductoDto {
        const busqueda = typeof query.busqueda === "string" && query.busqueda.trim()
            ? query.busqueda.trim()
            : undefined;

        return new FiltroProductoDto(busqueda);
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
    ) {}

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
        );
    }

    static fromEntityList(productos: Array<Parameters<typeof ProductoResponseDto.fromEntity>[0]>): ProductoResponseDto[] {
        return productos.map((p) => ProductoResponseDto.fromEntity(p));
    }
}

