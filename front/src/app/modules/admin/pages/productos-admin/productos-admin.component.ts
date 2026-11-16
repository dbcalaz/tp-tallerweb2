import { CurrencyPipe } from '@angular/common';
import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { CategoriasService } from '../../../../api/services/categorias/categoria.service';
import { ProductosAdminService } from '../../../../api/services/productos/productos-admin.service';
import { ToastService } from '../../../../shared/toast.service';
import { Categoria, TipoProducto } from '../../../productos/interfaces/categoria.interface';
import { AdminHeaderComponent } from '../../components/admin-header/admin-header.component';
import { PaginaProductosAdmin, ProductoAdmin } from '../../interfaces/producto-admin.interface';

type EstadoFiltro = 'todos' | 'activos' | 'inactivos';

@Component({
  selector: 'app-productos-admin',
  imports: [CurrencyPipe, AdminHeaderComponent],
  templateUrl: './productos-admin.component.html',
})
export class ProductosAdminComponent implements OnInit {
  private readonly productosAdmin = inject(ProductosAdminService);
  private readonly categoriasService = inject(CategoriasService);
  private readonly toast = inject(ToastService);

  private ultimoPedido = 0;

  protected readonly pagina = signal<PaginaProductosAdmin | null>(null);
  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');

  protected readonly paginaActual = signal(1);
  protected readonly filasPorPagina = signal(12);
  protected readonly opcionesFilas = [12, 24, 48];

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly tipos = signal<TipoProducto[]>([]);
  protected readonly categoriaId = signal(0);
  protected readonly tipoId = signal(0);
  protected readonly estado = signal<EstadoFiltro>('todos');

  protected readonly productoSeleccionado = signal<ProductoAdmin | null>(null);

  protected readonly tiposVisibles = computed(() => {
    const categoria = this.categoriaId();
    return categoria === 0 ? this.tipos() : this.tipos().filter((t) => t.categoriaId === categoria);
  });
  protected readonly nombreCategoria = computed(
    () => this.categorias().find((c) => c.id === this.categoriaId())?.nombre ?? 'Todas',
  );
  protected readonly nombreTipo = computed(
    () => this.tipos().find((t) => t.id === this.tipoId())?.nombre ?? 'Todos',
  );
  protected readonly nombreEstado = computed(
    () => ({ todos: 'Todos', activos: 'Habilitados', inactivos: 'Deshabilitados' })[this.estado()],
  );

  protected readonly paginasVisibles = computed(() => {
    const total = this.pagina()?.totalPaginas ?? 1;
    const inicio = Math.max(1, Math.min(this.paginaActual() - 2, total - 4));
    const fin = Math.min(total, inicio + 4);
    return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
  });

  ngOnInit(): void {
    this.categoriasService.listCategorias().subscribe({ next: (c) => this.categorias.set(c) });
    this.categoriasService.listTiposProducto().subscribe({ next: (t) => this.tipos.set(t) });
    this.cargar();
  }

  protected cargar(): void {
    const pedido = ++this.ultimoPedido;
    this.cargando.set(true);
    this.error.set('');
    const estado = this.estado();

    this.productosAdmin
      .listar({
        pagina: this.paginaActual(),
        limite: this.filasPorPagina(),
        categoriaId: this.categoriaId() || undefined,
        tipoProductoId: this.tipoId() || undefined,
        estado: estado === 'todos' ? undefined : estado,
      })
      .pipe(
        finalize(() => {
          if (pedido === this.ultimoPedido) this.cargando.set(false);
        }),
      )
      .subscribe({
        next: (pagina) => {
          if (pedido !== this.ultimoPedido) return;
          if (pagina.items.length === 0 && this.paginaActual() > 1) {
            this.paginaActual.set(pagina.totalPaginas);
            this.cargar();
            return;
          }
          this.pagina.set(pagina);
        },
        error: () => {
          if (pedido === this.ultimoPedido) {
            this.error.set('No se pudieron cargar los productos. Intentá nuevamente.');
          }
        },
      });
  }

  protected irAPagina(numero: number): void {
    const total = this.pagina()?.totalPaginas ?? 1;
    this.paginaActual.set(Math.min(Math.max(1, numero), total));
    this.cargar();
  }

  protected cambiarFilas(filas: number): void {
    this.filasPorPagina.set(filas);
    this.paginaActual.set(1);
    this.cargar();
  }

  protected cambiarCategoria(id: number): void {
    this.categoriaId.set(id);
    this.tipoId.set(0);
    this.paginaActual.set(1);
    this.cargar();
  }

  protected cambiarTipo(id: number): void {
    this.tipoId.set(id);
    this.paginaActual.set(1);
    this.cargar();
  }

  protected cambiarEstado(valor: string): void {
    this.estado.set(valor === 'activos' || valor === 'inactivos' ? valor : 'todos');
    this.paginaActual.set(1);
    this.cargar();
  }

  protected abrirModal(producto: ProductoAdmin): void {
    this.productoSeleccionado.set(producto);
  }

  protected cerrarModal(): void {
    if (!this.guardando()) this.productoSeleccionado.set(null);
  }

  @HostListener('document:keydown.escape')
  protected alPresionarEscape(): void {
    this.cerrarModal();
  }

  protected confirmarDeshabilitar(): void {
    const producto = this.productoSeleccionado();
    if (producto) this.cambiarActivo(producto, false);
  }

  protected rehabilitar(producto: ProductoAdmin): void {
    this.cambiarActivo(producto, true);
  }

  private cambiarActivo(producto: ProductoAdmin, activo: boolean): void {
    if (this.guardando()) return;
    this.guardando.set(true);

    this.productosAdmin
      .cambiarActivo(producto.id, activo)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.productoSeleccionado.set(null);
          this.toast.showSuccess(
            `"${producto.nombre}" se ${activo ? 'rehabilitó' : 'deshabilitó'} correctamente.`,
          );
          this.cargar();
        },
        error: () => this.toast.showSuccess('No se pudo actualizar el producto. Intentá nuevamente.'),
      });
  }
}
