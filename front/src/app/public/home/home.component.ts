import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoriasService } from '../../api/services/categorias/categoria.service';
import { CardCategoriaComponent } from '../../modules/productos/components/card-categoria/card-categoria.component';
import { Categoria } from '../../modules/productos/interfaces/categoria.interface';

@Component({
  selector: 'app-home',
  imports: [CardCategoriaComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly categoriasService = inject(CategoriasService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly cargando = signal(true);

  ngOnInit(): void {
    this.categoriasService
      .listCategorias()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.categorias.set(res),
        error: (err) => {
          console.error('Error al listar categorías', err);
          this.cargando.set(false);
        },
        complete: () => this.cargando.set(false),
      });
  }
}
