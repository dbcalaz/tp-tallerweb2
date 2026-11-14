import { Categoria } from '../../../../modules/productos/interfaces/categoria.interface';
import { CategoriaRest } from './categoria.interface.rest';

export class CategoriaMapper {
  static mapRestToFront(c: CategoriaRest): Categoria {
    return {
      id: c.id,
      nombre: c.nombre,
      imagenUrl: c.imagenUrl ?? '',
      cantidadProductos: c.cantidadProductos,
    };
  }

  static mapRestArrayToFront(lista: CategoriaRest[]): Categoria[] {
    return lista.map((c) => CategoriaMapper.mapRestToFront(c));
  }
}
