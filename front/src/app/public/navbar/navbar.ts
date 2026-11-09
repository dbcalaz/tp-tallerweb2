import { Component, HostListener, inject, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthSessionService } from '../../api/services/auth/auth-session.service';
import { CarritoComponent } from '../../modules/carrito/pages/carrito/carrito.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CarritoComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly router = inject(Router);

  protected readonly authSession = inject(AuthSessionService);
  protected menuUsuarioAbierto = false;

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
