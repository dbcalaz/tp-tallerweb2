import { Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ProductosService } from '../../../../api/services/productos/productos.service';
import { CardProductoComponent } from '../../components/card-producto/card-producto.component';
import { SidebarFiltrosComponent } from '../../components/sidebar-filtros/sidebar-filtros';
import { CategoriaFiltro, OpcionFiltro } from '../../interfaces/filtros.interface';
import { Producto } from '../../interfaces/producto.interface';

@Component({
  selector: 'app-catalog-page',
  imports: [RouterLink, CardProductoComponent, SidebarFiltrosComponent],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css',
})
export class CatalogoComponent implements OnInit {
  private readonly productosService = inject(ProductosService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  protected readonly productos = signal<Producto[]>([]);
  protected readonly cargando = signal(true);

  protected readonly categoriasSel = signal<number[]>([]);
  protected readonly tiposSel = signal<number[]>([]);
  protected readonly marcasSel = signal<number[]>([]);

  protected readonly categoriaId = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => {
        const valor = params.get('categoria');
        return valor ? Number(valor) : null;
      }),
    ),
    { initialValue: null },
  );

  constructor() {
    effect(() => {
      this.categoriaId();
      this.categoriasSel.set([]);
      this.tiposSel.set([]);
      this.marcasSel.set([]);
    });
  }

  protected readonly categoriasOpciones = computed<CategoriaFiltro[]>(() => {
    const categorias = new Map<number, CategoriaFiltro>();
    for (const p of this.productos()) {
      let cat = categorias.get(p.categoriaId);
      if (!cat) {
        cat = { id: p.categoriaId, nombre: p.categoria, cantidad: 0, tipos: [] };
        categorias.set(p.categoriaId, cat);
      }
      cat.cantidad++;
      let tipo = cat.tipos.find((t) => t.id === p.tipoId);
      if (!tipo) {
        tipo = { id: p.tipoId, nombre: p.tipo, cantidad: 0 };
        cat.tipos.push(tipo);
      }
      tipo.cantidad++;
    }
    const lista = [...categorias.values()];
    lista.forEach((c) => c.tipos.sort((a, b) => a.nombre.localeCompare(b.nombre)));
    return lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  protected readonly tiposOpciones = computed<OpcionFiltro[]>(
    () => this.categoriasOpciones().find((c) => c.id === this.categoriaId())?.tipos ?? [],
  );

  protected readonly marcasOpciones = computed<OpcionFiltro[]>(() => {
    const marcas = new Map<number, OpcionFiltro>();
    for (const p of this.productos()) {
      if (!this.pasaCategoriaYTipo(p)) continue;
      const marca = marcas.get(p.marcaId) ?? { id: p.marcaId, nombre: p.marca, cantidad: 0 };
      marca.cantidad++;
      marcas.set(p.marcaId, marca);
    }
    return [...marcas.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  protected readonly marcasActivas = computed(() =>
    this.marcasSel().filter((id) => this.marcasOpciones().some((m) => m.id === id)),
  );


  private readonly categoriaDeTipo = computed(() => {
    const mapa = new Map<number, number>();
    for (const p of this.productos()) mapa.set(p.tipoId, p.categoriaId);
    return mapa;
  });

  private readonly categoriasActivas = computed(() => {
    const id = this.categoriaId();
    return id !== null ? [id] : this.categoriasSel();
  });

  private pasaCategoriaYTipo(p: Producto): boolean {
    const categorias = this.categoriasActivas();
    if (categorias.length === 0) return true;
    if (!categorias.includes(p.categoriaId)) return false;

    const tiposDeSuCategoria = this.tiposSel().filter(
      (t) => this.categoriaDeTipo().get(t) === p.categoriaId,
    );
    return tiposDeSuCategoria.length === 0 || tiposDeSuCategoria.includes(p.tipoId);
  }

  protected readonly productosFiltrados = computed(() => {
    const marcas = this.marcasActivas();
    return this.productos().filter(
      (p) => this.pasaCategoriaYTipo(p) && (marcas.length === 0 || marcas.includes(p.marcaId)),
    );
  });

  protected readonly tituloCategoria = computed(() => {
    if (this.categoriaId() === null) return 'Todos los productos';
    return this.categoriasOpciones().find((c) => c.id === this.categoriaId())?.nombre ?? 'Categoría';
  });

  private alternar(lista: number[], id: number): number[] {
    return lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id];
  }

  protected alternarCategoria(id: number): void {
    const estabaTildada = this.categoriasSel().includes(id);
    this.categoriasSel.update((lista) => this.alternar(lista, id));
    if (estabaTildada) {
      // Al destildar una categoría, se destildan sus tipos
      this.tiposSel.update((lista) => lista.filter((t) => this.categoriaDeTipo().get(t) !== id));
    }
  }

  protected alternarTipo(id: number): void {
    this.tiposSel.update((lista) => this.alternar(lista, id));
  }

  protected alternarMarca(id: number): void {
    this.marcasSel.update((lista) => this.alternar(lista, id));
  }

  protected limpiarFiltros(): void {
    this.categoriasSel.set([]);
    this.tiposSel.set([]);
    this.marcasSel.set([]);
  }

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
