import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { CarritoService } from '../../../../api/services/carrito/carrito.service';
import { ProductosService } from '../../../../api/services/productos/productos.service';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './detalle-producto.component.html',
  styleUrl: './detalle-producto.component.css',
})
export class DetalleProductoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productosService = inject(ProductosService);
  private readonly carritoService = inject(CarritoService);

  readonly cantidad = signal(1);

  readonly producto = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => {
        this.cantidad.set(1);
        const id = Number(params.get('id'));
        return this.productosService.getProductoPorId(id);
      }),
    ),
  );

  // Precio dividido en seis cuotas.
  readonly cuota = computed(() => (this.producto()?.precio ?? 0) / 6);

  // Precio con el descuento del 10% por transferencia.
  readonly precioTransferencia = computed(() => (this.producto()?.precio ?? 0) * 0.9);

  incrementarCantidad(): void {
    const stock = this.producto()?.stock ?? 1;
    this.cantidad.update((c) => Math.min(c + 1, Math.max(stock, 1)));
  }

  decrementarCantidad(): void {
    this.cantidad.update((c) => Math.max(1, c - 1));
  }

  agregarAlCarrito(): void {
    const prod = this.producto();
    if (prod) {
      this.carritoService.agregarProducto(prod, this.cantidad());
    }
  }
}
