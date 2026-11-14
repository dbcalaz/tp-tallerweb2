import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Producto } from '../../../modules/productos/interfaces/producto.interface';
import { ProductoRestDto } from '../../dto/producto.dto';
import { ProductoMapper } from './mapping/producto.mapper';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly http = inject(HttpClient);

  listProductos(busqueda = ''): Observable<Producto[]> {
    const params = busqueda
      ? new HttpParams().set('busqueda', busqueda)
      : new HttpParams();

    return this.http
      .get<ProductoRestDto[]>(`${environment.API_URL}/productos`, { params })
      .pipe(map((res) => ProductoMapper.mapRestArrayToFront(res)));
  }

  getProductoPorId(id: number): Observable<Producto> {
    return this.http
      .get<ProductoRestDto>(`${environment.API_URL}/productos/${id}`)
      .pipe(map((res) => ProductoMapper.mapRestToFront(res)));
  }
}
