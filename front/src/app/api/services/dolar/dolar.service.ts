import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { DolarCotizacionDto } from '../../dto/dolar.dto';

@Injectable({ providedIn: 'root' })
export class DolarService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://dolarapi.com/v1/dolares/oficial';
  private readonly storageKey = 'tecnova.dolar.oficial';
  private readonly cacheTtlMs = 15 * 60 * 1000;

  readonly venta = signal<number | null>(this.readCachedRate());

  constructor() {
    if (this.venta() === null) {
      this.cargarCotizacion();
    }
  }

  convertirDesdeArs(precioArs: number): number | null {
    const cotizacion = this.venta();
    if (!cotizacion || cotizacion <= 0 || !Number.isFinite(precioArs)) {
      return null;
    }
    return precioArs / cotizacion;
  }

  private cargarCotizacion(): void {
    this.http
      .get<DolarCotizacionDto>(this.apiUrl)
      .pipe(
        tap((res) => {
          const valor = Number(res?.venta);
          if (Number.isFinite(valor) && valor > 0) {
            this.venta.set(valor);
            this.saveCachedRate(valor);
          }
        }),
        catchError(() => of(null)),
      )
      .subscribe();
  }

  private readCachedRate(): number | null {
    try {
      const raw = sessionStorage.getItem(this.storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { venta?: number; savedAt?: number };
      if (
        typeof parsed.venta === 'number' &&
        parsed.venta > 0 &&
        typeof parsed.savedAt === 'number' &&
        Date.now() - parsed.savedAt < this.cacheTtlMs
      ) {
        return parsed.venta;
      }
      return null;
    } catch {
      return null;
    }
  }

  private saveCachedRate(venta: number): void {
    try {
      sessionStorage.setItem(
        this.storageKey,
        JSON.stringify({ venta, savedAt: Date.now() }),
      );
    } catch {
    }
  }
}
