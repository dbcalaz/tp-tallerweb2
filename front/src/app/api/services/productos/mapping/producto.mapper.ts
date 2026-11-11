import { Producto } from '../../../../modules/productos/interfaces/producto.interface';
import { ProductoRest } from './producto.interface.rest';

export class ProductoMapper {
  static mapRestToFront(p: ProductoRest): Producto {
    return {
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion ?? '',
      precio: Number(p.precio),
      stock: p.stock,
      imagenUrl: p.imagenUrl ?? '',
      marca: p.marca?.nombre ?? '',
      marcaId: p.marca?.id ?? 0,
      tipo: p.tipoProducto?.nombre ?? '',
      tipoId: p.tipoProducto?.id ?? 0,
      categoriaId: p.tipoProducto?.categoria?.id ?? 0,
      categoria: p.tipoProducto?.categoria?.nombre ?? '',
    };
  }

  static mapRestArrayToFront(lista: ProductoRest[]): Producto[] {
    return lista.map((p) => ProductoMapper.mapRestToFront(p));
  }
}
