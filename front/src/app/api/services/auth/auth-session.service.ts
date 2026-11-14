import { Injectable, computed, signal } from '@angular/core';
import { AuthenticatedUser } from '../../../modules/usuarios/interfaces/usuario.interface';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly storageKey = 'taller-web-ii.authenticated-user';
  private readonly userSignal = signal<AuthenticatedUser | null>(this.readUser());
  readonly currentUser = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  start(user: AuthenticatedUser): void {
    this.userSignal.set(user);
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(user));
    } catch {
    }
  }

  clear(): void {
    this.userSignal.set(null);
    try {
      sessionStorage.removeItem(this.storageKey);
    } catch {
    }
  }

  private readUser(): AuthenticatedUser | null {
    try {
      const value = sessionStorage.getItem(this.storageKey);
      if (!value) return null;
      const user = JSON.parse(value) as AuthenticatedUser;
      return user.id && user.email && user.nombre && user.apellido ? user : null;
    } catch {
      return null;
    }
  }
}
