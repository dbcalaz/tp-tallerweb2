import { Component, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, debounce, distinctUntilChanged, map, of, switchMap, tap, timer, } from 'rxjs';
import { BusquedaService } from '../../../../api/services/busqueda/busqueda.service';
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
export class CatalogoComponent {
  private readonly productosService = inject(ProductosService);
  private readonly route = inject(ActivatedRoute);
  private readonly busqueda = inject(BusquedaService);

  protected readonly texto = this.busqueda.texto;
  protected readonly cargando = signal(true);

  protected readonly productos = toSignal(
    toObservable(this.texto).pipe(
      map((t) => t.trim()),
      debounce((t) => timer(t === '' ? 0 : 200)),
      distinctUntilChanged(),
      switchMap((t) => {
        this.cargando.set(true);
        return this.productosService.listProductos(t).pipe(
          catchError((err) => {
            console.error('Error al listar productos', err);
            return of([] as Producto[]);
          }),
        );
      }),
      tap(() => this.cargando.set(false)),
    ),
    { initialValue: [] as Producto[] },
  );

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

  protected readonly categoriasTildadas = computed(() =>
    this.categoriasSel().filter((id) => this.categoriasOpciones().some((c) => c.id === id)),
  );

  protected readonly tiposActivos = computed(() => {
    const existentes = new Set(
      this.categoriasOpciones().flatMap((c) => c.tipos.map((t) => t.id)),
    );
    return this.tiposSel().filter((id) => existentes.has(id));
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
    return id !== null ? [id] : this.categoriasTildadas();
  });

  private pasaCategoriaYTipo(p: Producto): boolean {
    const categorias = this.categoriasActivas();
    if (categorias.length === 0) return true;
    if (!categorias.includes(p.categoriaId)) return false;

    const tiposDeSuCategoria = this.tiposActivos().filter(
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

  protected readonly orden = signal<'nombre' | 'precio_asc' | 'precio_desc'>('nombre');

  protected readonly productosOrdenados = computed(() => {
    const lista = [...this.productosFiltrados()];
    switch (this.orden()) {
      case 'precio_asc':
        return lista.sort((a, b) => a.precio - b.precio);
      case 'precio_desc':
        return lista.sort((a, b) => b.precio - a.precio);
      default:
        return lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    }
  });

  protected cambiarOrden(valor: string): void {
    this.orden.set(valor as 'nombre' | 'precio_asc' | 'precio_desc');
  }

  protected readonly tituloCategoria = computed(() => {
    const id = this.categoriaId();
    if (id === null) return 'Todos los productos';
    return this.productos().find((p) => p.categoriaId === id)?.categoria ?? 'Categoría';
  });


  private alternar(lista: number[], id: number): number[] {
    return lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id];
  }

  protected alternarCategoria(id: number): void {
    const estabaTildada = this.categoriasSel().includes(id);
    this.categoriasSel.update((lista) => this.alternar(lista, id));
    if (estabaTildada) {
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
}
