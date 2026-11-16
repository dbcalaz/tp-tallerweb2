import { Injectable, computed, signal } from '@angular/core';
import { AuthenticatedUser } from '../../../modules/usuarios/interfaces/usuario.interface';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly storageKey = 'taller-web-ii.authenticated-user';
  private readonly tokenKey = 'taller-web-ii.auth-token';
  private readonly tokenSignal = signal<string | null>(this.readToken());
  private readonly userSignal = signal<AuthenticatedUser | null>(this.readUser());
  readonly currentUser = this.userSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null && this.tokenSignal() !== null);
  readonly isAdmin = computed(() => this.userSignal()?.rol === 'ADMIN');

  start(user: AuthenticatedUser, token: string): void {
    this.userSignal.set(user);
    this.tokenSignal.set(token);
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(user));
      sessionStorage.setItem(this.tokenKey, token);
    } catch {
    }
  }

  updateUser(user: AuthenticatedUser): void {
    this.userSignal.set(user);
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(user));
    } catch {
    }
  }

  clear(): void {
    this.userSignal.set(null);
    this.tokenSignal.set(null);
    try {
      sessionStorage.removeItem(this.storageKey);
      sessionStorage.removeItem(this.tokenKey);
    } catch {
    }
  }

  private readToken(): string | null {
    try {
      return sessionStorage.getItem(this.tokenKey);
    } catch {
      return null;
    }
  }

  private readUser(): AuthenticatedUser | null {
    if (this.tokenSignal() === null) return null;
    try {
      const value = sessionStorage.getItem(this.storageKey);
      if (!value) return null;
      const user = JSON.parse(value) as AuthenticatedUser;
      return user.id && user.email && user.nombre && user.apellido && user.rol ? user : null;
    } catch {
      return null;
    }
  }
}
