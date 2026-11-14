import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CategoriasService } from '../../api/services/categorias/categoria.service';
import { ProductosService } from '../../api/services/productos/productos.service';
import { CardCategoriaComponent } from '../../modules/productos/components/card-categoria/card-categoria.component';
import { CardProductoComponent } from '../../modules/productos/components/card-producto/card-producto.component';
import { Categoria } from '../../modules/productos/interfaces/categoria.interface';
import { Producto } from '../../modules/productos/interfaces/producto.interface';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CardCategoriaComponent, CardProductoComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly categoriasService = inject(CategoriasService);
  private readonly productosService = inject(ProductosService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly productos = signal<Producto[]>([]);

  protected readonly destacados = computed(() =>
    this.productos()
      .filter((p) => p.stock > 0)
      .sort((a, b) => b.precio - a.precio)
      .slice(0, 4),
  );

  ngOnInit(): void {
    this.categoriasService
      .listCategorias()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.categorias.set(res),
        error: (err) => console.error('Error al listar categorías', err),
      });

    this.productosService
      .listProductos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.productos.set(res),
        error: (err) => console.error('Error al listar productos', err),
      });
  }
}
