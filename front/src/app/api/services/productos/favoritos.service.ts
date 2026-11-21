import { HttpClient } from '@angular/common/http';
import { Injectable, effect, inject, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ProductoRestDto } from '../../dto/producto.dto';
import { ProductoMapper } from './mapping/producto.mapper';
import { AuthSessionService } from '../auth/auth-session.service';
import { ToastService } from '../../../shared/toast.service';
import { Producto } from '../../../modules/productos/interfaces/producto.interface';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthSessionService);
  private readonly toast = inject(ToastService);
  private loadedFor: string | number | null = null;
  readonly ids = signal<Set<number>>(new Set());
  readonly productos = signal<Producto[]>([]);

  constructor() {
    effect(() => {
      const userId = this.auth.currentUser()?.id ?? null;
      if (String(userId) === String(this.loadedFor)) return;
      this.loadedFor = userId;
      this.ids.set(new Set());
      this.productos.set([]);
      if (userId !== null) this.cargar();
    });
  }

  esFavorito(productoId: number): boolean { return this.ids().has(productoId); }

  alternar(producto: Producto): void {
    const user = this.auth.currentUser();
    if (!user) { this.toast.showSuccess('Iniciá sesión para guardar favoritos.'); return; }
    const quitar = this.ids().has(producto.id);
    const request = quitar
      ? this.http.delete(`${environment.API_URL}/favoritos/${producto.id}`)
      : this.http.post(`${environment.API_URL}/favoritos/${producto.id}`, {});
    request.subscribe({
      next: () => {
        const next = new Set(this.ids());
        if (quitar) { next.delete(producto.id); this.productos.update((items) => items.filter((item) => item.id !== producto.id)); }
        else { next.add(producto.id); this.productos.update((items) => [producto, ...items.filter((item) => item.id !== producto.id)]); }
        this.ids.set(next);
        this.toast.showSuccess(quitar ? 'Producto quitado de favoritos.' : 'Producto agregado a favoritos.');
      },
      error: () => this.toast.showError('No se pudo actualizar favoritos. Intentá nuevamente.'),
    });
  }

  cargar(): void {
    this.http.get<ProductoRestDto[]>(`${environment.API_URL}/favoritos`).subscribe({
      next: (items) => {
        const productos = ProductoMapper.mapRestArrayToFront(items);
        this.productos.set(productos);
        this.ids.set(new Set(productos.map((item) => item.id)));
      },
      error: () => this.toast.showError('No se pudieron cargar tus favoritos.'),
    });
  }
}
