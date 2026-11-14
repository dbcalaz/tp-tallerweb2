import { CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
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

  readonly cantidadEnCarrito = computed(() => {
    const id = this.producto()?.id;
    if (id === undefined) return 0;
    return this.carritoService.items().find((i) => i.productoId === id)?.cantidad ?? 0;
  });

  readonly stockDisponible = computed(() =>
    Math.max(0, (this.producto()?.stock ?? 0) - this.cantidadEnCarrito()),
  );

  readonly sinStockDisponible = computed(() => this.stockDisponible() === 0);

  readonly puedeDecrementar = computed(() => this.cantidad() > 1);

  readonly puedeIncrementar = computed(
    () => this.stockDisponible() > 0 && this.cantidad() < this.stockDisponible(),
  );

  readonly puedeAgregar = computed(
    () => this.stockDisponible() > 0 && this.cantidad() > 0 && this.cantidad() <= this.stockDisponible(),
  );

  constructor() {
    effect(() => {
      const disponible = this.stockDisponible();
      const actual = untracked(() => this.cantidad());

      if (disponible <= 0) {
        if (actual !== 0) this.cantidad.set(0);
      } else if (actual === 0 || actual > disponible) {
        this.cantidad.set(Math.min(Math.max(actual, 1), disponible));
      }
    });
  }

  incrementarCantidad(): void {
    const disponible = this.stockDisponible();
    if (disponible <= 0) return;
    this.cantidad.update((c) => Math.min(c + 1, disponible));
  }

  decrementarCantidad(): void {
    this.cantidad.update((c) => Math.max(1, c - 1));
  }

  agregarAlCarrito(): void {
    const prod = this.producto();
    if (!prod || !this.puedeAgregar()) return;
    this.carritoService.agregarProducto(prod, this.cantidad());
  }
}
