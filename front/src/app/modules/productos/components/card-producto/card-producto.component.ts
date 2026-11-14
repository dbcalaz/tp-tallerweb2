import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, inject } from '@angular/core';
import { Producto } from '../../interfaces/producto.interface';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../carrito/pages/carrito/cart.service';
import { AuthSessionService } from '../../../../api/services/auth/auth-session.service';
import { ToastService } from '../../../../shared/toast.service';

@Component({
  selector: 'app-card-producto',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './card-producto.component.html',
  styleUrl: './card-producto.component.css',
})
export class CardProductoComponent {
  producto = input.required<Producto>();
  private readonly cartService = inject(CartService);
  private readonly authSession = inject(AuthSessionService);
  private readonly toast = inject(ToastService);

  cantidadEnCarrito = computed(() => {
    const productoId = this.producto().id;
    const item = this.cartService.items().find(
      i => (i.productoId ?? i.producto?.id) === productoId
    );
    return item?.cantidad ?? 0;
  });

  stockDisponible = computed(() => {
    const stock = this.producto().stock;
    return Math.max(0, stock - this.cantidadEnCarrito());
  });

  enStock = computed(() => this.stockDisponible() > 0);
  stockLabel = computed(() => {
    const disponible = this.stockDisponible();
    const stock = this.producto().stock;
    if (stock > 5 && disponible > 5) return 'En stock';
    if (disponible > 0) return `Últimas ${disponible} unidades`;
    if (stock > 0) return 'En carrito';
    return 'Sin stock';
  });
  cuota = computed(() => this.producto().precio / 6);

  addToCart(): void {
    const user = this.authSession.currentUser() as { id: string | number } | null;
    if (!user) {
      alert('Debes iniciar sesión para agregar productos al carrito');
      return;
    }

    if (this.stockDisponible() === 0) {
      return;
    }

    this.cartService.addProduct({
      userId: Number(user.id),
      productoId: this.producto().id,
      cantidad: 1,
    }).subscribe({
      next: (response) => {
        this.cartService.loadCart(Number(user.id));
        this.toast.showSuccess('Producto agregado al carrito');
      },
      error: (error) => {
        console.error('Error al agregar al carrito:', error);
      },
    });
  }
}
