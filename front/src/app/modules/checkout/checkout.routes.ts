import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { CheckoutEntregaComponent } from './pages/checkout-entrega/checkout-entrega.component';
import { CheckoutPagoComponent } from './pages/checkout-pago/checkout-pago.component';
import { CheckoutFinalizadaComponent } from './pages/checkout-finalizada/checkout-finalizada.component';

export const checkoutRoutes: Routes = [
  {
    path: 'checkout/entrega',
    component: CheckoutEntregaComponent,
    canActivate: [authGuard],
  },
  {
    path: 'checkout/pago',
    component: CheckoutPagoComponent,
    canActivate: [authGuard],
  },
  {
    path: 'checkout/finalizada',
    component: CheckoutFinalizadaComponent,
    canActivate: [authGuard],
  },
];
