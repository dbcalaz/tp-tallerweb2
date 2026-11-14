import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Producto } from '../../../modules/productos/interfaces/producto.interface';
import { ToastService } from '../../../shared/toast.service';
import {
  ActualizarCantidadCarritoDto,
  AgregarItemCarritoDto,
  CarritoItemResponseDto,
  CarritoResponseDto,
  CheckoutRequestDto,
  CheckoutResponseDto,
} from '../../dto/carrito.dto';
import { AuthSessionService } from '../auth/auth-session.service';

export interface CarritoItem {
  id?: number;
  productoId: number;
  cantidad: number;
  producto: {
    id: number;
    nombre: string;
    descripcion?: string;
    precio: number;
    imagenUrl: string;
    stock?: number;
    marca?: string;
    tipo?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly http = inject(HttpClient);
  private readonly authSession = inject(AuthSessionService);
  private readonly toastService = inject(ToastService);

  private readonly legacyStorageKey = 'tecnova_carrito_items';
  private userIdActual: string | number | null = null;

  readonly items = signal<CarritoItem[]>([]);
  readonly isOpen = signal<boolean>(false);

  readonly totalItems = computed(() =>
    this.items().reduce((acc, item) => acc + item.cantidad, 0),
  );

  readonly subtotal = computed(() =>
    this.items().reduce((acc, item) => acc + Number(item.producto.precio) * item.cantidad, 0),
  );

  readonly cuotas = computed(() => Math.round(this.subtotal() / 6));

  constructor() {
    try {
      localStorage.removeItem(this.legacyStorageKey);
    } catch {
    }

    effect(() => {
      const userId = this.authSession.currentUser()?.id ?? null;
      if (String(userId) === String(this.userIdActual)) return;

      if (this.userIdActual != null) {
        try {
          localStorage.removeItem(this.storageKeyFor(this.userIdActual));
        } catch {
        }
      }

      this.userIdActual = userId;
      this.cerrarCarrito();
      this.items.set(userId != null ? this.readLocalItems(userId) : []);

      if (userId != null) {
        this.cargarCarritoUsuario(userId);
      }
    });

    effect(() => {
      const current = this.items();
      const userId = this.userIdActual;
      if (userId == null) return;
      try {
        localStorage.setItem(this.storageKeyFor(userId), JSON.stringify(current));
      } catch {
      }
    });
  }

  abrirCarrito(): void {
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  cerrarCarrito(): void {
    this.isOpen.set(false);
    document.body.style.overflow = '';
  }

  alternarCarrito(): void {
    if (this.isOpen()) {
      this.cerrarCarrito();
    } else {
      this.abrirCarrito();
    }
  }

  cargarCarritoUsuario(userId: string | number): void {
    this.http.get<CarritoResponseDto>(`${environment.API_URL}/carrito/${userId}`).subscribe({
      next: (res) => {
        if (String(this.userIdActual) !== String(userId)) return;
        if (!Array.isArray(res?.items)) return;

        const remoteItems: CarritoItem[] = res.items.map((it: CarritoItemResponseDto) => ({
          id: it.id,
          productoId: it.productoId,
          cantidad: it.cantidad,
          producto: {
            id: it.producto.id,
            nombre: it.producto.nombre,
            descripcion: it.producto.descripcion,
            precio: Number(it.producto.precio),
            imagenUrl: it.producto.imagenUrl || 'images/placeholder.jpg',
            stock: it.producto.stock,
            marca: it.producto.marca?.nombre ?? '',
            tipo: it.producto.tipoProducto?.nombre ?? '',
          },
        }));

        this.items.set(remoteItems);
      },
      error: () => {
      },
    });
  }

  agregarProducto(producto: Producto, cantidad = 1): void {
    const user = this.authSession.currentUser();
    if (!user?.id) {
      this.toastService.showSuccess('Iniciá sesión para agregar productos al carrito.');
      return;
    }

    const stock = producto.stock ?? 0;
    const yaEnCarrito =
      this.items().find((i) => i.productoId === producto.id)?.cantidad ?? 0;
    const disponible = Math.max(0, stock - yaEnCarrito);

    if (disponible <= 0) {
      this.toastService.showSuccess(`No hay más unidades de "${producto.nombre}" disponibles.`);
      return;
    }

    cantidad = Math.min(cantidad, disponible);

    const current = [...this.items()];
    const index = current.findIndex((i) => i.productoId === producto.id);

    if (index >= 0) {
      current[index] = {
        ...current[index],
        cantidad: current[index].cantidad + cantidad,
      };
    } else {
      current.push({
        productoId: producto.id,
        cantidad,
        producto: {
          id: producto.id,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: Number(producto.precio),
          imagenUrl: producto.imagenUrl || 'images/placeholder.jpg',
          stock: producto.stock,
          marca: producto.marca ?? '',
          tipo: producto.tipo ?? '',
        },
      });
    }

    this.items.set(current);
    this.toastService.showSuccess(`¡Agregaste "${producto.nombre}" al carrito!`);

    this.syncBackendAdd(user.id, producto.id, cantidad);
  }

  actualizarCantidad(productoId: number, cantidad: number): void {
    if (cantidad <= 0) {
      this.removerProducto(productoId);
      return;
    }

    const current = this.items().map((i) =>
      i.productoId === productoId ? { ...i, cantidad } : i,
    );
    this.items.set(current);

    const user = this.authSession.currentUser();
    if (user?.id) {
      const body = new ActualizarCantidadCarritoDto(cantidad);
      this.http
        .patch<CarritoResponseDto>(`${environment.API_URL}/carrito/${user.id}/items/${productoId}`, body)
        .subscribe({
          error: (err) => {
            console.error('Error al actualizar en backend:', err);
            const msg = err?.error?.message;
            if (msg) this.toastService.showSuccess(msg);
          },
        });
    }
  }

  removerProducto(productoId: number): void {
    const current = this.items().filter((i) => i.productoId !== productoId);
    this.items.set(current);

    const user = this.authSession.currentUser();
    if (user?.id) {
      this.http
        .delete<CarritoResponseDto>(`${environment.API_URL}/carrito/${user.id}/items/${productoId}`)
        .subscribe({
          error: (err) => console.error('Error al remover en backend:', err),
        });
    }
  }

  vaciarCarrito(): void {
    this.items.set([]);

    const user = this.authSession.currentUser();
    if (user?.id) {
      this.http
        .delete<CarritoResponseDto>(`${environment.API_URL}/carrito/${user.id}`)
        .subscribe({
          error: (err) => console.error('Error al vaciar en backend:', err),
        });
    }
  }

  checkout(direccionEnvio?: string): Observable<CheckoutResponseDto> {
    const user = this.authSession.currentUser();
    if (!user?.id) {
      throw new Error('Debes iniciar sesión para finalizar la compra.');
    }

    const body = new CheckoutRequestDto(direccionEnvio);
    return this.http
      .post<CheckoutResponseDto>(`${environment.API_URL}/carrito/${user.id}/checkout`, body)
      .pipe(
        tap(() => {
          this.items.set([]);
          this.toastService.showSuccess('¡Tu compra se realizó con éxito!');
        }),
      );
  }

  private syncBackendAdd(userId: string | number, productoId: number, cantidad: number): void {
    const body = new AgregarItemCarritoDto(productoId, cantidad);
    this.http
      .post<CarritoResponseDto>(`${environment.API_URL}/carrito/${userId}/items`, body)
      .subscribe({
        error: (err) => console.error('Error al sincronizar con backend:', err),
      });
  }

  private storageKeyFor(userId: string | number): string {
    return `carrito_user_${userId}`;
  }

  private readLocalItems(userId: string | number): CarritoItem[] {
    try {
      const raw = localStorage.getItem(this.storageKeyFor(userId));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as CarritoItem[]) : [];
    } catch {
      return [];
    }
  }
}
