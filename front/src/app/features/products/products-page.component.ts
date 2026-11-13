import { Component, inject } from '@angular/core';
import { CartService } from '../cart/cart.service';
import { AuthSessionService } from '../users/data-access/auth-session.service';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-products-page',
  templateUrl: './../products/products-page.component.html',
  styleUrl: './../products/products-page.component.css',
})
export class ProductsPageComponent {
  private readonly cartService = inject(CartService);
  private readonly authSession = inject(AuthSessionService);
  private readonly toast = inject(ToastService);

  addToCart(productId: number): void {
    const user = this.authSession.currentUser();
    if (!user) {
      alert('Debes iniciar sesión para agregar productos al carrito');
      return;
    }

    this.cartService.addProduct({
      userId: Number(user.id),
      productId: productId,
      cantidad: 1,
    }).subscribe({
      next: (response) => {
        this.cartService.loadCart(Number(user.id));
        this.toast.showSuccess('Producto agregado al carrito');
      },
      error: (error) => {
        console.error('Error al agregar al carrito:', error);
        alert('Hubo un error al agregar el producto');
      },
    });
  }
}
