import { Categoria } from '../../../../modules/productos/interfaces/categoria.interface';
import { CategoriaRestDto } from '../../../dto/categoria.dto';

export class CategoriaMapper {
  static mapRestToFront(c: CategoriaRestDto): Categoria {
    return {
      id: c.id,
      nombre: c.nombre,
      imagenUrl: c.imagenUrl ?? '',
      cantidadProductos: c.cantidadProductos,
    };
  }

  static mapRestArrayToFront(lista: CategoriaRestDto[]): Categoria[] {
    return lista.map((c) => CategoriaMapper.mapRestToFront(c));
  }
}
