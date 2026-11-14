import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from './cart.service';
import { AuthSessionService } from '../../../../api/services/auth/auth-session.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent {
  private readonly cartService = inject(CartService);
  private readonly authSession = inject(AuthSessionService);

  isOpen = signal(false);
  readonly items = this.cartService.items;
  readonly itemCount = this.cartService.itemCount;
  readonly isEmpty = this.cartService.isEmpty;

  readonly subtotal = computed(() =>
    this.items().reduce((total, item) => total + this.getItemTotal(item), 0)
  );

  readonly envio = computed(() => (this.subtotal() > 0 ? 0 : 0));
  readonly total = computed(() => this.subtotal() + this.envio());
  readonly cuotas3 = computed(() => this.total() / 3);
  readonly cuotas6 = computed(() => this.total() / 6);

  getItemTotal(item: CartItem): number {
    return Number(item.producto?.precio ?? 0) * item.cantidad;
  }

  openCart(): void {
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
    this.loadCart();
  }

  closeCart(): void {
    this.isOpen.set(false);
    document.body.style.overflow = '';
  }

  private loadCart(): void {
    const user = this.authSession.currentUser() as { id: string | number } | null;
    if (user) {
      this.cartService.loadCart(Number(user.id));
    }
  }

  increaseQuantity(item: CartItem): void {
    const user = this.authSession.currentUser() as { id: string | number } | null;
    if (user) {
      const productoId = item.productoId ?? item.producto?.id;
      if (!productoId) return;
      this.cartService.updateItemQuantity({
        userId: Number(user.id),
        productoId,
        cantidad: item.cantidad + 1,
      });
    }
  }

  decreaseQuantity(item: CartItem): void {
    const user = this.authSession.currentUser() as { id: string | number } | null;
    if (user && item.cantidad > 1) {
      const productoId = item.productoId ?? item.producto?.id;
      if (!productoId) return;
      this.cartService.updateItemQuantity({
        userId: Number(user.id),
        productoId,
        cantidad: item.cantidad - 1,
      });
    }
  }

  removeItem(item: CartItem): void {
    const user = this.authSession.currentUser() as { id: string | number } | null;
    if (user) {
      const productoId = item.productoId ?? item.producto?.id;
      if (!productoId) return;
      this.cartService.removeProduct({
        userId: Number(user.id),
        productoId,
      });
    }
  }

  clearCart(): void {
    const user = this.authSession.currentUser() as { id: string | number } | null;
    if (user) {
      this.cartService.clearCart(Number(user.id));
    }
  }

  formatPrice(price: number): string {
    return price.toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
}