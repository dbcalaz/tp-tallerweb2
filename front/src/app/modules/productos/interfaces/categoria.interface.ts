export interface Categoria {
  id: number;
  nombre: string;
  imagenUrl: string;
  cantidadProductos: number;
}

export interface TipoProducto {
  id: number;
  nombre: string;
  categoriaId: number;
}
