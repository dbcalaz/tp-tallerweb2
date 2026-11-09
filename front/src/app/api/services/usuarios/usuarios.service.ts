import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  LoginData,
  SignupData,
  SignupResponse,
} from '../../../modules/usuarios/interfaces/usuario.interface';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);

  register(data: SignupData): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${environment.API_URL}/usuario/registro`, data);
  }

  login(data: LoginData): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${environment.API_URL}/usuario/login`, data);
  }
}
