import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Producto } from '../../interfaces/producto.interface';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../../../api/services/carrito/carrito.service';

@Component({
  selector: 'app-card-producto',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './card-producto.component.html',
  styleUrl: './card-producto.component.css',
})
export class CardProductoComponent {
  private readonly carritoService = inject(CarritoService);

  producto = input.required<Producto>();

  enStock = computed(() => this.producto().stock > 5);
  stockLabel = computed(() => {
    const stock = this.producto().stock;
    if (stock > 5) return 'En stock';
    if (stock > 0) return `Últimas ${stock} unidades`;
    return 'Sin stock';
  });
  cuota = computed(() => this.producto().precio / 6);

  agregarAlCarrito(event: MouseEvent): void {
    event.stopPropagation();
    this.carritoService.agregarProducto(this.producto());
  }
}
