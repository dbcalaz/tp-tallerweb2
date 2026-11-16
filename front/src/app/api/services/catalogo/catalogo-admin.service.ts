import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CatalogoAdminRestDto } from '../../dto/catalogo-admin.dto';

@Injectable({ providedIn: 'root' })
export class CatalogoAdminService {
  private readonly http = inject(HttpClient);

  obtener(): Observable<CatalogoAdminRestDto> {
    return this.http.get<CatalogoAdminRestDto>(`${environment.API_URL}/admin/catalogo`);
  }
}
