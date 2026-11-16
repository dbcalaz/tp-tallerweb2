export class TipoAdminResponseDto {
    constructor(
        public readonly id: number,
        public readonly nombre: string,
        public readonly categoriaId: number,
        public readonly activo: boolean,
        public readonly cantidadProductos: number,
    ) {}
}

export class CategoriaAdminResponseDto {
    constructor(
        public readonly id: number,
        public readonly nombre: string,
        public readonly imagenUrl: string | null,
        public readonly activo: boolean,
        public readonly cantidadProductos: number,
        public readonly tipos: TipoAdminResponseDto[],
    ) {}

    static fromEntity(categoria: {
        id: number;
        nombre: string;
        imagenUrl: string | null;
        activo: boolean;
        tiposProducto: Array<{
            id: number;
            nombre: string;
            categoriaId: number;
            activo: boolean;
            _count: { productos: number };
        }>;
    }): CategoriaAdminResponseDto {
        const tipos = categoria.tiposProducto.map(
            (t) => new TipoAdminResponseDto(t.id, t.nombre, t.categoriaId, t.activo, t._count.productos),
        );

        return new CategoriaAdminResponseDto(
            categoria.id,
            categoria.nombre,
            categoria.imagenUrl,
            categoria.activo,
            tipos.reduce((total, t) => total + t.cantidadProductos, 0),
            tipos,
        );
    }
}

export class MarcaAdminResponseDto {
    constructor(
        public readonly id: number,
        public readonly nombre: string,
        public readonly activo: boolean,
        public readonly cantidadProductos: number,
    ) {}

    static fromEntity(marca: {
        id: number;
        nombre: string;
        activo: boolean;
        _count: { productos: number };
    }): MarcaAdminResponseDto {
        return new MarcaAdminResponseDto(marca.id, marca.nombre, marca.activo, marca._count.productos);
    }
}

export class CatalogoAdminResponseDto {
    constructor(
        public readonly categorias: CategoriaAdminResponseDto[],
        public readonly marcas: MarcaAdminResponseDto[],
    ) {}
}