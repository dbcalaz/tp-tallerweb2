import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  FiltroProductosAdmin,
  PaginaProductosAdmin,
} from '../../../modules/admin/interfaces/producto-admin.interface';
import { PaginaProductosAdminRestDto } from '../../dto/producto-admin.dto';
import { ProductoMapper } from './mapping/producto.mapper';

@Injectable({ providedIn: 'root' })
export class ProductosAdminService {
  private readonly http = inject(HttpClient);

  listar(filtro: FiltroProductosAdmin): Observable<PaginaProductosAdmin> {
    let params = new HttpParams().set('pagina', filtro.pagina).set('limite', filtro.limite);
    if (filtro.busqueda) params = params.set('busqueda', filtro.busqueda);
    if (filtro.categoriaId) params = params.set('categoriaId', filtro.categoriaId);
    if (filtro.tipoProductoId) params = params.set('tipoProductoId', filtro.tipoProductoId);
    if (filtro.estado) params = params.set('estado', filtro.estado);

    return this.http
      .get<PaginaProductosAdminRestDto>(`${environment.API_URL}/admin/productos`, { params })
      .pipe(
        map((res) => ({
          ...res,
          items: res.items.map((p) => ({ ...ProductoMapper.mapRestToFront(p), activo: p.activo })),
        })),
      );
  }

  cambiarActivo(id: number, activo: boolean): Observable<void> {
    return this.http
      .patch(`${environment.API_URL}/admin/productos/${id}/activo`, { activo })
      .pipe(map(() => undefined));
  }
}
