import { Component, HostListener, inject, ViewChild, effect } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthSessionService } from '../../api/services/auth/auth-session.service';
import { CarritoComponent } from '../../modules/carrito/pages/carrito/carrito.component';
import { CartService } from '../../modules/carrito/pages/carrito/cart.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { BusquedaService } from '../../api/services/busqueda/busqueda.service';


@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CarritoComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly router = inject(Router);

  protected readonly authSession = inject(AuthSessionService);
  protected readonly cartService = inject(CartService);
  protected menuUsuarioAbierto = false;
  protected readonly busqueda = inject(BusquedaService);
  protected readonly itemCount = this.cartService.itemCount;

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => {
        if (!e.urlAfterRedirects.startsWith('/catalogo')) {
          this.busqueda.limpiar();
        }
      });

    effect(() => {
      const user = this.authSession.currentUser();

      if (user) {
        this.cartService.loadCart(Number(user.id));
      } else {
        this.cartService.clearCart();
      }
    });
  }

  protected alBuscar(valor: string): void {
    this.busqueda.establecer(valor);

    if (valor.trim() !== '' && !this.router.url.startsWith('/catalogo')) {
      void this.router.navigateByUrl('/catalogo');
    }
  }

  @ViewChild(CarritoComponent)
  private cartDrawer!: CarritoComponent;

  protected abrirCarrito(): void {
    console.log('CLICK EN CARRITO');
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
