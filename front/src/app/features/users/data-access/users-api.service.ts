import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface SignupData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  direccion: string;
}

export interface SignupResponse {
  message: string;
  user: { id: string; email: string; nombre: string; apellido: string };
}

export interface LoginData { email: string; password: string; }

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);

  register(data: SignupData): Observable<SignupResponse> {
    return this.http.post<SignupResponse>('/api/usuario/registro', data);
  }

  login(data: LoginData): Observable<SignupResponse> {
    return this.http.post<SignupResponse>('/api/usuario/login', data);
  }
}
