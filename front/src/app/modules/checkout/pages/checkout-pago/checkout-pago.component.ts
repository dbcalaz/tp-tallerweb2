import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { AuthSessionService } from '../../../../api/services/auth/auth-session.service';
import { CarritoService } from '../../../../api/services/carrito/carrito.service';
import { ToastService } from '../../../../shared/toast.service';

declare global {
  interface Window {
    MercadoPago: new (publicKey: string, options?: { locale?: string }) => {
      getPaymentMethods: (params: { bin: string }) => Promise<any>;
      createCardToken: (params: any) => Promise<any>;
    };
  }
}

@Component({
  selector: 'app-checkout-pago',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './checkout-pago.component.html',
  styleUrl: './checkout-pago.component.css',
})
export class CheckoutPagoComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);
  private readonly carritoService = inject(CarritoService);
  private readonly toast = inject(ToastService);

  readonly items = this.carritoService.items;
  readonly subtotal = this.carritoService.subtotal;
  readonly cuotas = this.carritoService.cuotas;
  readonly totalItems = this.carritoService.totalItems;
  readonly deliveryData = this.carritoService.deliveryData;
  readonly isProcessing = signal(false);
  readonly cardBrand = signal<string>('');
  readonly mpReady = signal(false);
  readonly paymentMethodId = signal<string>('');
  readonly issuerId = signal<number | string | undefined>(undefined);

  readonly form = this.fb.group({
    cardNumber: ['', [Validators.required, (control) => {
      const cleanCardNumber = control.value?.replace(/\D/g, '') || '';
      return /^\d{13,19}$/.test(cleanCardNumber) ? null : { invalidCardNumber: true };
    }]],
    cardholderName: ['', [Validators.required, Validators.minLength(2)]],
    cardExpirationMonth: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)]],
    cardExpirationYear: ['', [Validators.required, Validators.pattern(/^\d{2}$/)]],
    securityCode: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    identificationNumber: ['', [Validators.required, Validators.pattern(/^\d{7,11}$/)]],
    installments: [6, [Validators.required, Validators.min(1)]],
  });

  private mp: any = null;

  private readonly installmentsControl = this.form.get('installments')!;
  readonly installments = toSignal(this.installmentsControl.valueChanges, {
    initialValue: Number(this.installmentsControl.value) || 1,
  });
  readonly cuotasSeleccionadas = computed(() => {
    const installments = this.installments();
    if (installments <= 1) return this.subtotal();
    return Math.round(this.subtotal() / installments);
  });

  constructor() {
    if (this.items().length === 0) {
      this.toast.showSuccess('El carrito está vacío.');
      void this.router.navigateByUrl('/catalogo');
      return;
    }

    if (!this.deliveryData()) {
      this.toast.showSuccess('Completá los datos de entrega primero.');
      void this.router.navigateByUrl('/checkout/entrega');
      return;
    }

    this.loadMercadoPago();
  }

  private sanitizeCardNumber(value: string): string {
    return value.replace(/\D/g, '');
  }

  private async getMercadoPagoInstance(): Promise<any> {
    if (this.mp) {
      return this.mp;
    }

    try {
      await (window as any).loadMercadoPago?.();
      this.mp = new (window as any).MercadoPago(environment.mpPublicKey, { locale: 'es-AR' });
      this.mpReady.set(true);
      return this.mp;
    } catch (err) {
      console.error('Error loading Mercado Pago SDK:', err);
      this.toast.showSuccess('Error al cargar el procesador de pagos. Recargá la página.');
      throw err;
    }
  }

  async resolverMetodoPago(bin: string): Promise<void> {
    const cleanDigits = this.sanitizeCardNumber(bin);
    const cleanBin = cleanDigits.slice(0, 6);

    if (!cleanBin || cleanBin.length < 6) {
      this.paymentMethodId.set('');
      this.issuerId.set(undefined);
      this.cardBrand.set('');
      return;
    }

    try {
      const mp = await this.getMercadoPagoInstance();
      const result = await mp.getPaymentMethods({ bin: cleanBin });
      if (result && result[0]) {
        this.paymentMethodId.set(result[0].id || '');
        this.cardBrand.set(result[0].id || '');
        const issuerId = result[0].issuer?.id;
        this.issuerId.set(issuerId ? Number(issuerId) : undefined);
      } else {
        const fallbackId = this.inferPaymentMethodId(cleanBin);
        this.paymentMethodId.set(fallbackId);
        this.cardBrand.set(fallbackId);
        this.issuerId.set(undefined);
      }
    } catch (err) {
      console.error('Error en getPaymentMethods:', err);
      const fallbackId = this.inferPaymentMethodId(cleanBin);
      this.paymentMethodId.set(fallbackId);
      this.cardBrand.set(fallbackId);
      this.issuerId.set(undefined);
    }
  }

  private inferPaymentMethodId(bin: string): string {
    if (bin.startsWith('4')) {
      return 'visa';
    }
    if (/^(5[1-5]|2[2-7]|5031)/.test(bin)) {
      return 'master';
    }
    if (/^3[47]/.test(bin)) {
      return 'amex';
    }
    return '';
  }

  async loadMercadoPago(): Promise<void> {
    try {
      await this.getMercadoPagoInstance();
    } catch (err) {
      // Error already handled in getMercadoPagoInstance
    }
  }

  async onCardNumberChange(value: string): Promise<void> {
    const cleanCardNumber = this.sanitizeCardNumber(value);
    if (cleanCardNumber.length >= 6) {
      const bin = cleanCardNumber.slice(0, 6);
      await this.resolverMetodoPago(bin);
    } else {
      this.paymentMethodId.set('');
      this.issuerId.set(undefined);
      this.cardBrand.set('');
    }
  }

  async confirmarCompra(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.showSuccess('Completá todos los campos requeridos para continuar.');
      return;
    }

    this.isProcessing.set(true);

    try {
      const mp = await this.getMercadoPagoInstance();
      const raw = this.form.getRawValue();
      const user = this.authSession.currentUser();
      if (!user?.email) {
        this.toast.showSuccess('Sesión inválida. Iniciá sesión nuevamente.');
        void this.router.navigateByUrl('/login');
        return;
      }

      const cleanCardNumber = this.sanitizeCardNumber(raw.cardNumber);
      const cardExpirationYear = `20${raw.cardExpirationYear}`;

      if (!this.paymentMethodId() && cleanCardNumber.length >= 6) {
        const bin = cleanCardNumber.slice(0, 6);
        await this.resolverMetodoPago(bin);
      }

      if (!this.paymentMethodId()) {
        this.toast.showSuccess('No se pudo identificar el método de pago. Verificá el número de tarjeta.');
        return;
      }

      let cardToken;
      try {
        cardToken = await mp.createCardToken({
          cardNumber: cleanCardNumber,
          cardholderName: raw.cardholderName,
          cardExpirationMonth: raw.cardExpirationMonth,
          cardExpirationYear: cardExpirationYear,
          securityCode: raw.securityCode,
          identificationType: 'DNI',
          identificationNumber: raw.identificationNumber,
        });
      } catch (mpError) {
        console.error('Mercado Pago createCardToken error:', mpError);
        throw new Error('Error al tokenizar la tarjeta. Verificá los datos.');
      }

      const delivery = this.deliveryData() || {};
      const payerEmail = delivery['email'] || user.email;

      await this.carritoService.checkout(
        `${delivery['calle']} ${delivery['altura']}, ${delivery['localidad']}, ${delivery['provincia']}`,
        {
          token: cardToken.id,
          paymentMethodId: this.paymentMethodId(),
          issuerId: this.issuerId(),
          installments: raw.installments,
          payerEmail,
          identificationType: 'DNI',
          identificationNumber: raw.identificationNumber,
        },
      ).toPromise();

      this.toast.showSuccess('¡Compra realizada con éxito!');
      void this.router.navigateByUrl('/checkout/finalizada');
    } catch (err: any) {
      console.error('Error en checkout:', err);
      const msg = err?.error?.message || err?.message || 'Hubo un error al procesar el pago. Verificá los datos de la tarjeta.';
      this.toast.showSuccess(msg);
    } finally {
      this.isProcessing.set(false);
    }
  }
}
