import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { CartService, CartItem } from './cart.service';
import { AuthSessionService } from '../users/data-access/auth-session.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.css'
})
export class CartPageComponent {
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
    console.log('ABRIENDO CARRITO');
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
    this.loadCart();
  }

  closeCart(): void {
    this.isOpen.set(false);
    document.body.style.overflow = '';
  }

  private loadCart(): void {
    const user = this.authSession.currentUser();
    if (user) {
      this.cartService.loadCart(Number(user.id));
    }
  }

  increaseQuantity(item: CartItem): void {
    const user = this.authSession.currentUser();
    if (user) {
      this.cartService.updateItemQuantity({
        userId: Number(user.id),
        productId: item.productId,
        cantidad: item.cantidad + 1,
      });
    }
  }

  decreaseQuantity(item: CartItem): void {
    const user = this.authSession.currentUser();
    if (user && item.cantidad > 1) {
      this.cartService.updateItemQuantity({
        userId: Number(user.id),
        productId: item.productId,
        cantidad: item.cantidad - 1,
      });
    }
  }

  removeItem(item: CartItem): void {
    const user = this.authSession.currentUser();
    if (user) {
      this.cartService.removeProduct({
        userId: Number(user.id),
        productId: item.productId,
      });
    }
  }

  clearCart(): void {
    const user = this.authSession.currentUser();
    if (user) {
      this.items().forEach(item => {
        this.cartService.removeProduct({
          userId: Number(user.id),
          productId: item.productId,
        });
      });
    }
  }

  formatPrice(price: number): string {
    return price.toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
}
