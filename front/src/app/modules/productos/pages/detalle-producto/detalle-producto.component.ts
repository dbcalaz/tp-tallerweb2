import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

import { ProductosService } from '../../../../api/services/productos/productos.service';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [],
  templateUrl: './detalle-producto.component.html',
  styleUrl: './detalle-producto.component.css',
})
export class DetalleProductoComponent {
  private route = inject(ActivatedRoute);
  private productosService = inject(ProductosService);

  producto = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => {
        const id = Number(params.get('id'));
        return this.productosService.getProductoPorId(id);
      })
    )
  );

  // Precio dividido en seis cuotas.
  cuota = computed(() => (this.producto()?.precio ?? 0) / 6);

  // Precio con el descuento del 10% por transferencia.
  precioTransferencia = computed(
    () => (this.producto()?.precio ?? 0) * 0.9
  );

  // Formateo de importes para mostrar pesos argentinos.
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(precio);
  }

  getPrecioFormateado(): string {
    return this.formatearPrecio(this.producto()?.precio ?? 0);
  }

  getCuotaFormateada(): string {
    return this.formatearPrecio(this.cuota());
  }

  getPrecioTransferenciaFormateado(): string {
    return this.formatearPrecio(this.precioTransferencia());
  }
}
