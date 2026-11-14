export class CategoriaResponseDto {
    constructor(
        public readonly id: number,
        public readonly nombre: string,
        public readonly imagenUrl: string | null,
        public readonly cantidadProductos: number,
    ) {}

    static fromEntity(categoria: {
        id: number;
        nombre: string;
        imagenUrl: string | null;
        tiposProducto: Array<{ _count: { productos: number } }>;
    }): CategoriaResponseDto {
        const cantidadProductos = categoria.tiposProducto.reduce(
            (total, tipo) => total + tipo._count.productos,
            0,
        );

        return new CategoriaResponseDto(
            categoria.id,
            categoria.nombre,
            categoria.imagenUrl,
            cantidadProductos,
        );
    }

    static fromEntityList(categorias: Array<Parameters<typeof CategoriaResponseDto.fromEntity>[0]>): CategoriaResponseDto[] {
        return categorias.map((c) => CategoriaResponseDto.fromEntity(c));
    }
}

