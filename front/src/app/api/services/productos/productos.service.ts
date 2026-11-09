import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Producto } from '../../../modules/productos/interfaces/producto.interface';
import { ProductoRest } from './mapping/producto.interface.rest';
import { ProductoMapper } from './mapping/producto.mapper';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly http = inject(HttpClient);

  listProductos(): Observable<Producto[]> {
    return this.http
      .get<ProductoRest[]>(`${environment.API_URL}/productos`)
      .pipe(map((res) => ProductoMapper.mapRestArrayToFront(res)));
  }
}
