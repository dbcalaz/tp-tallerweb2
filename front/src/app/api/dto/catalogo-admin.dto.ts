export interface TipoAdminRestDto {
  id: number;
  nombre: string;
  categoriaId: number;
  activo: boolean;
  cantidadProductos: number;
}

export interface CategoriaAdminRestDto {
  id: number;
  nombre: string;
  imagenUrl: string | null;
  activo: boolean;
  cantidadProductos: number;
  tipos: TipoAdminRestDto[];
}

export interface MarcaAdminRestDto {
  id: number;
  nombre: string;
  activo: boolean;
  cantidadProductos: number;
}

export interface CatalogoAdminRestDto {
  categorias: CategoriaAdminRestDto[];
  marcas: MarcaAdminRestDto[];
}
