import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Producto } from '../../interfaces/producto.interface';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../../../api/services/carrito/carrito.service';
import { DolarService } from '../../../../api/services/dolar/dolar.service';
import { FavoritosService } from '../../../../api/services/productos/favoritos.service';

@Component({
  selector: 'app-card-producto',
  imports: [CurrencyPipe, DecimalPipe, RouterLink],
  templateUrl: './card-producto.component.html',
  styleUrl: './card-producto.component.css',
})
export class CardProductoComponent {
  private readonly carritoService = inject(CarritoService);
  private readonly dolarService = inject(DolarService);
  protected readonly favoritosService = inject(FavoritosService);

  producto = input.required<Producto>();

  enStock = computed(() => this.producto().stock > 5);
  stockLabel = computed(() => {
    const stock = this.producto().stock;
    if (stock > 5) return 'En stock';
    if (stock > 0) return `Últimas ${stock} unidades`;
    return 'Sin stock';
  });
  cuota = computed(() => this.producto().precio / 6);
  precioUsd = computed(() => this.dolarService.convertirDesdeArs(this.producto().precio));

  cantidadEnCarrito = computed(() => {
    const id = this.producto().id;
    return this.carritoService.items().find((i) => i.productoId === id)?.cantidad ?? 0;
  });

  stockDisponible = computed(() =>
    Math.max(0, (this.producto().stock ?? 0) - this.cantidadEnCarrito()),
  );

  sinStockDisponible = computed(() => this.stockDisponible() === 0);

  agregarAlCarrito(event: MouseEvent): void {
    event.stopPropagation();
    if (this.sinStockDisponible()) return;
    this.carritoService.agregarProducto(this.producto());
  }

  alternarFavorito(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoritosService.alternar(this.producto());
  }
}
