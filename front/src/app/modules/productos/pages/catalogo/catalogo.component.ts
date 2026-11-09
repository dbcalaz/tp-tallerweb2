import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProductosService } from '../../../../api/services/productos/productos.service';
import { CardProductoComponent } from '../../components/card-producto/card-producto.component';
import { Producto } from '../../interfaces/producto.interface';

@Component({
  selector: 'app-catalog-page',
  imports: [RouterLink, CardProductoComponent],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css',
})
export class CatalogoComponent implements OnInit, OnDestroy {
  private readonly productosService = inject(ProductosService);
  private readonly destroy$ = new Subject<void>();

  protected readonly productos = signal<Producto[]>([]);
  protected readonly cargando = signal(true);

  ngOnInit(): void {
    this.productosService
      .listProductos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => this.productos.set(res),
        error: (err) => {
          console.error('Error al listar productos', err);
          this.cargando.set(false);
        },
        complete: () => this.cargando.set(false),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
