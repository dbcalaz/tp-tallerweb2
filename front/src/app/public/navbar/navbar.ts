import { Component, computed, HostListener, inject, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthSessionService } from '../../api/services/auth/auth-session.service';
import { CarritoComponent } from '../../modules/carrito/pages/carrito/carrito.component';
import { CarritoService } from '../../api/services/carrito/carrito.service';
import { DolarService } from '../../api/services/dolar/dolar.service';
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
  private readonly dolarService = inject(DolarService);

  protected readonly authSession = inject(AuthSessionService);
  protected readonly carritoService = inject(CarritoService);
  protected menuUsuarioAbierto = false;
  protected menuNavegacionAbierto = false;
  protected readonly busqueda = inject(BusquedaService);

  private readonly anunciosBase = [
    { icon: 'local_shipping', text: 'Envíos gratis a todo el país' },
    { icon: 'credit_card', text: '3 y 6 cuotas fijas' },
    { icon: 'verified', text: 'Garantía oficial directa 12 meses' },
    { icon: 'account_balance', text: '10% OFF pagando con transferencia' },
    { icon: 'bolt', text: 'Despacho en el día para AMBA' },
    { icon: 'receipt_long', text: 'Emitimos Factura A y B' },
    { icon: 'support_agent', text: 'Soporte técnico especializado' },
    { icon: 'security', text: 'Compra protegida con Mercado Pago' },
  ];

  protected readonly anuncios = computed(() => {
    const cotizacion = this.dolarService.venta();
    if (!cotizacion) {
      return this.anunciosBase;
    }
    const valorFormateado = cotizacion.toLocaleString('es-AR', { maximumFractionDigits: 0 });
    return [
      ...this.anunciosBase,
      { icon: 'attach_money', text: `Dólar: $${valorFormateado}` },
    ];
  });

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
  }

  protected alBuscar(valor: string): void {
    this.busqueda.establecer(valor);

    if (valor.trim() !== '' && !this.router.url.startsWith('/catalogo')) {
      void this.router.navigateByUrl('/catalogo');
    }
  }

  protected alternarMenuNavegacion(event: MouseEvent): void {
    event.stopPropagation();
    this.menuNavegacionAbierto = !this.menuNavegacionAbierto;
  }

  protected cerrarMenuNavegacion(): void { this.menuNavegacionAbierto = false; }

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
    this.cerrarMenuNavegacion();
  }

  @HostListener('document:keydown.escape')
  protected alPresionarEscape(): void {
    this.cerrarMenuUsuario();
  }
}
