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
      tipo: p.tipoProducto?.nombre ?? '',
    };
  }

  static mapRestArrayToFront(lista: ProductoRest[]): Producto[] {
    return lista.map((p) => ProductoMapper.mapRestToFront(p));
  }
}
