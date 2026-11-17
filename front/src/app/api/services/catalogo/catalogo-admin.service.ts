import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CatalogoAdminRestDto } from '../../dto/catalogo-admin.dto';

export interface CategoriaPayload { nombre: string; imagenUrl: string | null; }
export interface TipoPayload { nombre: string; categoriaId: number; }
export interface MarcaPayload { nombre: string; }

@Injectable({ providedIn: 'root' })
export class CatalogoAdminService {
  private readonly http = inject(HttpClient);

  obtener(): Observable<CatalogoAdminRestDto> {
    return this.http.get<CatalogoAdminRestDto>(`${environment.API_URL}/admin/catalogo`);
  }

  obtenerOpciones(): Observable<CatalogoAdminRestDto> {
    return this.http.get<CatalogoAdminRestDto>(`${environment.API_URL}/admin/catalogo/opciones`);
  }

  crearCategoria(payload: CategoriaPayload): Observable<unknown> { return this.http.post(`${environment.API_URL}/admin/catalogo/categorias`, payload); }
  editarCategoria(id: number, payload: CategoriaPayload): Observable<unknown> { return this.http.patch(`${environment.API_URL}/admin/catalogo/categorias/${id}`, payload); }
  estadoCategoria(id: number, activo: boolean): Observable<unknown> { return this.http.patch(`${environment.API_URL}/admin/catalogo/categorias/${id}/estado`, { activo }); }
  crearTipo(payload: TipoPayload): Observable<unknown> { return this.http.post(`${environment.API_URL}/admin/catalogo/categorias/${payload.categoriaId}/tipos`, payload); }
  editarTipo(id: number, payload: TipoPayload): Observable<unknown> { return this.http.patch(`${environment.API_URL}/admin/catalogo/tipos/${id}`, payload); }
  estadoTipo(id: number, activo: boolean): Observable<unknown> { return this.http.patch(`${environment.API_URL}/admin/catalogo/tipos/${id}/estado`, { activo }); }
  crearMarca(payload: MarcaPayload): Observable<unknown> { return this.http.post(`${environment.API_URL}/admin/catalogo/marcas`, payload); }
  editarMarca(id: number, payload: MarcaPayload): Observable<unknown> { return this.http.patch(`${environment.API_URL}/admin/catalogo/marcas/${id}`, payload); }
  estadoMarca(id: number, activo: boolean): Observable<unknown> { return this.http.patch(`${environment.API_URL}/admin/catalogo/marcas/${id}/estado`, { activo }); }
}
