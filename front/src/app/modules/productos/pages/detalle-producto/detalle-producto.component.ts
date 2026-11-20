import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { CarritoService } from '../../../../api/services/carrito/carrito.service';
import { DolarService } from '../../../../api/services/dolar/dolar.service';
import { ProductosService } from '../../../../api/services/productos/productos.service';
import { FavoritosService } from '../../../../api/services/productos/favoritos.service';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './detalle-producto.component.html',
  styleUrl: './detalle-producto.component.css',
})
export class DetalleProductoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productosService = inject(ProductosService);
  private readonly carritoService = inject(CarritoService);
  private readonly dolarService = inject(DolarService);
  protected readonly favoritosService = inject(FavoritosService);

  readonly cantidad = signal(1);
  readonly almacenamiento = signal<'1TB' | '2TB'>('1TB');

  readonly producto = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => {
        this.cantidad.set(1);
        this.almacenamiento.set('1TB');
        const id = Number(params.get('id'));
        return this.productosService.getProductoPorId(id);
      }),
    ),
  );

  readonly extraAlmacenamiento = computed(() => (this.almacenamiento() === '2TB' ? 350000 : 0));

  readonly precioFinal = computed(() => (this.producto()?.precio ?? 0) + this.extraAlmacenamiento());

  // Precio dividido en seis cuotas.
  readonly cuota = computed(() => this.precioFinal() / 6);

  // Precio con el descuento del 10% por transferencia.
  readonly precioTransferencia = computed(() => this.precioFinal() * 0.9);

  readonly precioUsd = computed(() => {
    const precio = this.precioFinal();
    return precio > 0 ? this.dolarService.convertirDesdeArs(precio) : null;
  });

  readonly especificaciones = computed<string[]>(() => {
    const desc = this.producto()?.descripcion?.trim() ?? '';
    if (!desc) return [];
    const partes = desc
      .split(/\s*[•|\n]\s*/)
      .map((s) => s.trim().replace(/\.$/, ''))
      .filter(Boolean);
    return partes.length > 1 ? partes : [];
  });

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

  seleccionarAlmacenamiento(opcion: '1TB' | '2TB'): void {
    this.almacenamiento.set(opcion);
  }

  agregarAlCarrito(): void {
    const prod = this.producto();
    if (!prod || !this.puedeAgregar()) return;
    this.carritoService.agregarProducto(
      {
        ...prod,
        precio: this.precioFinal(),
      },
      this.cantidad(),
    );
  }

  alternarFavorito(): void {
    const producto = this.producto();
    if (producto) this.favoritosService.alternar(producto);
  }
}
