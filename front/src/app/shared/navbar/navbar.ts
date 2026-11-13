import { Component, HostListener, inject, ViewChild, effect } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthSessionService } from '../../features/users/data-access/auth-session.service';
import { CartPageComponent } from '../../features/cart/cart-page.component';
import { CartService } from '../../features/cart/cart.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CartPageComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly router = inject(Router);

  protected readonly authSession = inject(AuthSessionService);
  protected readonly cartService = inject(CartService);
  protected readonly itemCount = this.cartService.itemCount;
  protected menuUsuarioAbierto = false;

  @ViewChild(CartPageComponent)
  private cartDrawer!: CartPageComponent;

  constructor() {
    effect(() => {
      const user = this.authSession.currentUser();

      if (user) {
        this.cartService.loadCart(Number(user.id));
      } else {
        this.cartService.clearCart();
      }
    });
  }

  protected abrirCarrito(): void {
    this.cartDrawer.openCart();
  }

  protected alternarMenuUsuario(event: MouseEvent): void {
    event.stopPropagation();
    this.menuUsuarioAbierto = !this.menuUsuarioAbierto;
  }

  protected cerrarMenuUsuario(): void {
    this.menuUsuarioAbierto = false;
  }

  protected logout(): void {
    this.cerrarMenuUsuario();
    this.authSession.clear();
    this.cartService.clearCart();
    void this.router.navigateByUrl('/login');
  }

  @HostListener('document:click')
  protected alHacerClickEnDocumento(): void {
    this.cerrarMenuUsuario();
  }

  @HostListener('document:keydown.escape')
  protected alPresionarEscape(): void {
    this.cerrarMenuUsuario();
  }
}