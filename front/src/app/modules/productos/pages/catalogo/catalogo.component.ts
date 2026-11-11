import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ProductosService } from '../../../../api/services/productos/productos.service';
import { CardProductoComponent } from '../../components/card-producto/card-producto.component';
import { Producto } from '../../interfaces/producto.interface';

@Component({
  selector: 'app-catalog-page',
  imports: [RouterLink, CardProductoComponent],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css',
})
export class CatalogoComponent implements OnInit {
  private readonly productosService = inject(ProductosService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  protected readonly productos = signal<Producto[]>([]);
  protected readonly cargando = signal(true);

  // Lee ?categoria=3 de la URL y lo convierte en signal (null si no hay)
  protected readonly categoriaId = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => {
        const valor = params.get('categoria');
        return valor ? Number(valor) : null;
      }),
    ),
    { initialValue: null },
  );

  // Si hay categoría seleccionada filtra; si no, devuelve todos
  protected readonly productosFiltrados = computed(() => {
    const id = this.categoriaId();
    const todos = this.productos();
    return id === null ? todos : todos.filter((p) => p.categoriaId === id);
  });

  protected readonly tituloCategoria = computed(() => {
    if (this.categoriaId() === null) return 'Todos los productos';
    return this.productosFiltrados()[0]?.categoria ?? 'Sin productos';
  });

  ngOnInit(): void {
    this.productosService
      .listProductos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.productos.set(res),
        error: (err) => {
          console.error('Error al listar productos', err);
          this.cargando.set(false);
        },
        complete: () => this.cargando.set(false),
      });
  }
}
