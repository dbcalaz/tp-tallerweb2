import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ActualizarPerfilRequestDto,
  AuthResponseDto,
  LoginRequestDto,
  PerfilUsuarioResponseDto,
  RegistroRequestDto,
} from '../../dto/usuario.dto';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);

  register(data: RegistroRequestDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${environment.API_URL}/usuario/registro`, data);
  }

  login(data: LoginRequestDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${environment.API_URL}/usuario/login`, data);
  }

  solicitarRecuperacion(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.API_URL}/usuario/recuperar-password`, { email });
  }

  restablecerPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.API_URL}/usuario/restablecer-password`, {
      token,
      password,
    });
  }

  getPerfil(userId: string | number): Observable<PerfilUsuarioResponseDto> {
    return this.http.get<PerfilUsuarioResponseDto>(`${environment.API_URL}/usuario/perfil/${userId}`);
  }

  updatePerfil(
    userId: string | number,
    data: ActualizarPerfilRequestDto,
  ): Observable<AuthResponseDto> {
    return this.http.put<AuthResponseDto>(`${environment.API_URL}/usuario/perfil/${userId}`, data);
  }
}
