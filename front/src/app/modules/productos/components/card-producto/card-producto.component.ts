import { CurrencyPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Producto } from '../../interfaces/producto.interface';

@Component({
  selector: 'app-card-producto',
  imports: [CurrencyPipe],
  templateUrl: './card-producto.component.html',
  styleUrl: './card-producto.component.css',
})
export class CardProductoComponent {
  producto = input.required<Producto>();

  enStock = computed(() => this.producto().stock > 5);
  stockLabel = computed(() => {
    const stock = this.producto().stock;
    if (stock > 5) return 'En stock';
    if (stock > 0) return `Últimas ${stock} unidades`;
    return 'Sin stock';
  });
  cuota = computed(() => this.producto().precio / 6);
}
