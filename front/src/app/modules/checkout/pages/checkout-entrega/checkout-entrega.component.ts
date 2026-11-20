import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthSessionService } from '../../../../api/services/auth/auth-session.service';
import { CarritoService } from '../../../../api/services/carrito/carrito.service';
import { ToastService } from '../../../../shared/toast.service';

@Component({
  selector: 'app-checkout-entrega',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './checkout-entrega.component.html',
  styleUrl: './checkout-entrega.component.css',
})
export class CheckoutEntregaComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);
  private readonly carritoService = inject(CarritoService);
  private readonly toast = inject(ToastService);

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    dni: ['', [Validators.required]],
    telefono: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    provincia: ['CABA', [Validators.required]],
    localidad: ['', [Validators.required]],
    calle: ['', [Validators.required]],
    altura: ['', [Validators.required]],
    piso: [''],
    depto: [''],
    codigoPostal: ['', [Validators.required]],
    indicaciones: [''],
  });

  readonly items = this.carritoService.items;
  readonly subtotal = this.carritoService.subtotal;
  readonly cuotas = this.carritoService.cuotas;
  readonly totalItems = this.carritoService.totalItems;
  readonly enviando = signal(false);

  constructor() {
    if (this.items().length === 0) {
      this.toast.showSuccess('El carrito está vacío.');
      void this.router.navigateByUrl('/catalogo');
      return;
    }

    const user = this.authSession.currentUser();
    if (user) {
      this.form.patchValue({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
      });
    }

    const saved = this.carritoService.deliveryData();
    if (saved) {
      this.form.patchValue(saved);
    }
  }

  volverAlCarrito(): void {
    void this.router.navigateByUrl('/catalogo');
  }

  continuarAlPago(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.showSuccess('Completá todos los campos requeridos para continuar.');
      return;
    }

    if (this.items().length === 0) {
      this.toast.showSuccess('El carrito está vacío.');
      void this.router.navigateByUrl('/catalogo');
      return;
    }

    this.enviando.set(true);
    const formData = this.form.getRawValue();
    this.carritoService.setDeliveryData(formData);

    setTimeout(() => {
      this.enviando.set(false);
      void this.router.navigateByUrl('/checkout/pago');
    }, 400);
  }
}
