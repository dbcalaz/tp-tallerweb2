import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthSessionService } from '../../../../api/services/auth/auth-session.service';
import { CarritoService } from '../../../../api/services/carrito/carrito.service';
import { ToastService } from '../../../../shared/toast.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css',
})
export class CarritoComponent {
  readonly carritoService = inject(CarritoService);
  readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  // Getter de compatibilidad con llamados directos
  get isOpen() {
    return this.carritoService.isOpen;
  }

  openCart(): void {
    this.carritoService.abrirCarrito();
  }

  closeCart(): void {
    this.carritoService.cerrarCarrito();
  }

  aumentarCantidad(productoId: number, cantidadActual: number): void {
    this.carritoService.actualizarCantidad(productoId, cantidadActual + 1);
  }

  disminuirCantidad(productoId: number, cantidadActual: number): void {
    this.carritoService.actualizarCantidad(productoId, cantidadActual - 1);
  }

  remover(productoId: number): void {
    this.carritoService.removerProducto(productoId);
  }

  vaciar(): void {
    this.carritoService.vaciarCarrito();
  }

  procederAlPago(): void {
    if (!this.authSession.isAuthenticated()) {
      this.closeCart();
      this.toast.showSuccess('Iniciá sesión para completar tu compra');
      void this.router.navigateByUrl('/login');
      return;
    }

    if (this.carritoService.items().length === 0) {
      return;
    }

    this.closeCart();
    void this.router.navigateByUrl('/checkout/entrega');
  }
}
