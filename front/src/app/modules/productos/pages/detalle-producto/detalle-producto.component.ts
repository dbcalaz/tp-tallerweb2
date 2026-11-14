import { Component, computed, inject, signal, effect, untracked} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

import { ProductosService } from '../../../../api/services/productos/productos.service';
import { CartService } from '../../../carrito/pages/carrito/cart.service';
import { AuthSessionService } from '../../../../api/services/auth/auth-session.service';
import { ToastService } from '../../../../shared/toast.service';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [],
  templateUrl: './detalle-producto.component.html',
  styleUrl: './detalle-producto.component.css',
})
export class DetalleProductoComponent {
  private route = inject(ActivatedRoute);
  private productosService = inject(ProductosService);
  private cartService = inject(CartService);
  private authSession = inject(AuthSessionService);
  private router = inject(Router);
  private toast = inject(ToastService);

  producto = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => {
        const id = Number(params.get('id'));
        return this.productosService.getProductoPorId(id);
      })
    )
  );

  cantidad = signal(1);

  cantidadEnCarrito = computed(() => {
    const productoId = this.producto()?.id;
    if (!productoId) return 0;
    const item = this.cartService.items().find(
      i => (i.productoId ?? i.producto?.id) === productoId
    );
    return item?.cantidad ?? 0;
  });

  stockDisponible = computed(() => {
    const stock = this.producto()?.stock ?? 0;
    return Math.max(0, stock - this.cantidadEnCarrito());
  });

  constructor() {
  effect(() => {
    const disponible = this.stockDisponible();
    const actual = untracked(() => this.cantidad());

    if (disponible === 0 && actual !== 0) {
      this.cantidad.set(0);
    } else if (disponible > 0 && actual === 0) {
      this.cantidad.set(1);
    } else if (actual > disponible) {
      this.cantidad.set(disponible);
    }
  });
}

  // Precio dividido en seis cuotas.
  cuota = computed(() => (this.producto()?.precio ?? 0) / 6);

  // Precio con el descuento del 10% por transferencia.
  precioTransferencia = computed(
    () => (this.producto()?.precio ?? 0) * 0.9
  );

  // Formateo de importes para mostrar pesos argentinos.
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(precio);
  }

  getPrecioFormateado(): string {
    return this.formatearPrecio(this.producto()?.precio ?? 0);
  }

  getCuotaFormateada(): string {
    return this.formatearPrecio(this.cuota());
  }

  getPrecioTransferenciaFormateado(): string {
    return this.formatearPrecio(this.precioTransferencia());
  }

  incrementarCantidad(): void {
    const disponible = this.stockDisponible();
    if (disponible === 0) return;
    if (this.cantidad() < disponible) {
      this.cantidad.update(c => c + 1);
    }
  }

  decrementarCantidad(): void {
    if (this.cantidad() > 1) {
      this.cantidad.update(c => c - 1);
    }
  }

  agregarAlCarrito(): void {
    const user = this.authSession.currentUser() as { id: string | number } | null;
    if (!user) {
      alert('Debes iniciar sesión para agregar productos al carrito');
      void this.router.navigateByUrl('/login');
      return;
    }

    const productoActual = this.producto();
    if (!productoActual) {
      return;
    }

    if (this.stockDisponible() === 0) {
      return;
    }

    if (this.cantidad() > this.stockDisponible()) {
      return;
    }

    this.cartService.addProduct({
      userId: Number(user.id),
      productoId: productoActual.id,
      cantidad: this.cantidad(),
    }).subscribe({
      next: (response) => {
        this.cartService.loadCart(Number(user.id));
        this.toast.showSuccess('Producto agregado al carrito');
        this.cantidad.set(1);
      },
      error: (error) => {
        console.error('Error al agregar al carrito:', error);
      },
    });
  }
}
