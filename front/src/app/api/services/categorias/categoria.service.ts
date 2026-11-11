import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Categoria } from '../../../modules/productos/interfaces/categoria.interface';
import { CategoriaRest } from './mapping/categoria.interface.rest';
import { CategoriaMapper } from './mapping/categoria.mapper';

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private readonly http = inject(HttpClient);

  listCategorias(): Observable<Categoria[]> {
    return this.http
      .get<CategoriaRest[]>(`${environment.API_URL}/categorias`)
      .pipe(map((res) => CategoriaMapper.mapRestArrayToFront(res)));
  }
}
