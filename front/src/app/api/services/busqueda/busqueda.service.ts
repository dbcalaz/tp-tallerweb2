import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BusquedaService {
  private readonly _texto = signal('');

  // Los demás solo pueden leerlo, no modificarlo directamente
  readonly texto = this._texto.asReadonly();

  establecer(valor: string): void {
    this._texto.set(valor);
  }

  limpiar(): void {
    this._texto.set('');
  }
}
