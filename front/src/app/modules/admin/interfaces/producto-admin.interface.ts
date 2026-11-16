import { Producto } from '../../productos/interfaces/producto.interface';

export interface ProductoAdmin extends Producto {
  activo: boolean;
}

export interface PaginaProductosAdmin {
  items: ProductoAdmin[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface FiltroProductosAdmin {
  pagina: number;
  limite: number;
  busqueda?: string | undefined;
  categoriaId?: number | undefined;
  tipoProductoId?: number | undefined;
  estado?: 'activos' | 'inactivos' | undefined;
}
