import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { jsPDF } from 'jspdf';
import { CarritoService } from '../../../../api/services/carrito/carrito.service';
import { AuthSessionService } from '../../../../api/services/auth/auth-session.service';

@Component({
  selector: 'app-checkout-finalizada',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './checkout-finalizada.component.html',
  styleUrl: './checkout-finalizada.component.css',
})
export class CheckoutFinalizadaComponent {
  private readonly router = inject(Router);
  private readonly carritoService = inject(CarritoService);
  private readonly authSession = inject(AuthSessionService);

  readonly compra = this.carritoService.ultimaCompra;
  readonly user = this.authSession.currentUser;
  readonly pagoMeta = this.carritoService.ultimoPagoMeta;
  readonly deliveryData = this.carritoService.deliveryData;

  readonly orderId = computed(() => `#AUS-${this.compra()?.id ?? '00000'}`);
  readonly installments = computed(() => this.pagoMeta()?.installments ?? 1);
  readonly paymentMethodId = computed(() => this.pagoMeta()?.paymentMethodId ?? '');
  readonly montoCuota = computed(() => {
    const total = Number(this.compra()?.total ?? 0);
    const installments = this.installments();
    if (installments <= 1) return total;
    return Math.round(total / installments);
  });
  readonly paymentMethodLabel = computed(() => {
    const id = this.paymentMethodId().toLowerCase();
    if (id === 'visa') return 'Visa';
    if (id === 'master' || id === 'mastercard') return 'Mastercard';
    if (id === 'amex') return 'American Express';
    if (id === 'cabal') return 'Cabal';
    if (id === 'elo') return 'Elo';
    return this.paymentMethodId() || 'Tarjeta';
  });
  readonly emailCompra = computed(() => {
    return this.pagoMeta()?.payerEmail || this.deliveryData()?.['email'] || this.user()?.email || '';
  });
  readonly formattedDate = computed(() => {
    const createdAt = this.compra()?.createdAt;
    if (!createdAt) return '';
    const date = new Date(createdAt);
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  });
  readonly formattedTime = computed(() => {
    const createdAt = this.compra()?.createdAt;
    if (!createdAt) return '';
    const date = new Date(createdAt);
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  constructor() {
    if (!this.compra()) {
      void this.router.navigateByUrl('/catalogo');
    }
  }

  copiarOrderId(): void {
    const id = this.compra()?.id?.toString() ?? '';
    if (id) {
      navigator.clipboard.writeText(id);
    }
  }

  descargarComprobantePDF(): void {
    if (!this.compra()) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const compra = this.compra()!;
    const detalles = compra.detalles || [];
    const total = Number(compra.total || 0);
    const installments = this.installments();
    const paymentMethod = this.paymentMethodLabel();
    const email = this.emailCompra();
    const direccion = compra.direccionEnvio || '';
    const orderId = this.orderId();
    const fecha = this.formattedDate();
    const hora = this.formattedTime();

    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('TECNOVA', pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Comprobante de Compra', pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setFontSize(10);
    doc.text(`Orden: ${orderId}`, pageWidth / 2, y, { align: 'center' });
    y += 6;
    doc.text(`Fecha: ${fecha} ${hora ? `${hora} hs` : ''}`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Datos del cliente y entrega', margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Email: ${email}`, margin, y);
    y += 6;
    doc.text(`Dirección de envío: ${direccion}`, margin, y);
    y += 6;
    doc.text(`Medio de pago: ${paymentMethod}`, margin, y);
    if (installments === 1) {
      doc.text(`Plan de pago: 1 pago`, margin, y);
    } else {
      doc.text(`Plan de pago: ${installments} cuotas fijas de $${this.montoCuota().toLocaleString('es-AR')} ARS`, margin, y);
    }
    y += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle de productos', margin, y);
    y += 8;

    doc.setFontSize(9);
    const colProducto = margin;
    const colCantidad = margin + 100;
    const colPrecioUnit = margin + 140;
    const colSubtotal = margin + 180;

    doc.setFont('helvetica', 'bold');
    doc.text('Producto', colProducto, y);
    doc.text('Cant.', colCantidad, y, { align: 'center' });
    doc.text('P. Unitario', colPrecioUnit, y, { align: 'right' });
    doc.text('Subtotal', colSubtotal, y, { align: 'right' });
    y += 6;

    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    for (const detalle of detalles) {
      const producto = detalle.producto;
      const cantidad = detalle.cantidad;
      const precioUnitario = Number(detalle.precioUnitario || 0);
      const subtotal = precioUnitario * cantidad;

      const nombre = doc.splitTextToSize(producto.nombre, 90);
      const lineHeight = 4;

      doc.text(nombre[0] || '', colProducto, y);
      doc.text(String(cantidad), colCantidad, y, { align: 'center' });
      doc.text(`$${precioUnitario.toLocaleString('es-AR')}`, colPrecioUnit, y, { align: 'right' });
      doc.text(`$${subtotal.toLocaleString('es-AR')}`, colSubtotal, y, { align: 'right' });
      y += lineHeight;

      if (nombre.length > 1) {
        for (let i = 1; i < nombre.length; i++) {
          doc.text(nombre[i], colProducto, y);
          y += lineHeight;
        }
      }

      y += 2;
    }

    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total abonado: $${total.toLocaleString('es-AR')} ARS`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('¡Gracias por tu compra en Tecnova!', pageWidth / 2, y, { align: 'center' });
    y += 6;
    doc.text('Si tenés alguna consulta, contactá a nuestro equipo con el código de orden.', pageWidth / 2, y, { align: 'center' });

    const fileName = `Comprobante-Tecnova-${orderId.replace('#', '').replace(/\s/g, '-')}.pdf`;
    doc.save(fileName);
  }
}
