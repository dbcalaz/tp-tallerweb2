import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { AdminHeaderComponent } from '../../components/admin-header/admin-header.component';
import { CatalogoAdminService } from '../../../../api/services/catalogo/catalogo-admin.service';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CatalogoAdminRestDto,
  CategoriaAdminRestDto,
  TipoAdminRestDto,
} from '../../../../api/dto/catalogo-admin.dto';

type EntidadKind = 'categoria' | 'tipo' | 'marca';

interface TipoPlano extends TipoAdminRestDto {
  categoriaNombre: string;
  habilitado: boolean; // tipo.activo && categoria.activo
}

interface ConfirmacionBaja {
  kind: EntidadKind;
  id: number;
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-categorias-admin',
  standalone: true,
  imports: [AdminHeaderComponent, FormsModule],
  templateUrl: './categoria-admin.component.html',
})
export class CategoriasAdminComponent implements OnInit {
  private readonly catalogoService = inject(CatalogoAdminService);

  readonly catalogo = signal<CatalogoAdminRestDto | null>(null);
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly abiertas = signal<ReadonlySet<number>>(new Set());

  modalKind: EntidadKind | null = null;
  editId: number | null = null;
  categoriaSeleccionada = 0;
  nombre = '';
  imagenUrl: string | null = null;
  imagenNombre = '';
  errorFormulario = '';
  guardando = false;

  confirmacion: ConfirmacionBaja | null = null;
  deshabilitando = false;
  errorConfirmacion = '';

  reglaPadreAbierta = false;

  readonly limiteLista = 3;
  readonly tiposExpandidos = signal(false);
  readonly marcasExpandidas = signal(false);

  readonly categorias = computed(() => this.catalogo()?.categorias ?? []);
  readonly marcas = computed(() => this.catalogo()?.marcas ?? []);

  readonly tiposPlanos = computed<TipoPlano[]>(() =>
    this.categorias().flatMap((c) =>
      c.tipos.map((t) => ({
        ...t,
        categoriaNombre: c.nombre,
        habilitado: t.activo && c.activo,
      })),
    ),
  );

  readonly tiposVisibles = computed(() =>
    this.tiposExpandidos() ? this.tiposPlanos() : this.tiposPlanos().slice(0, this.limiteLista),
  );

  readonly marcasVisibles = computed(() =>
    this.marcasExpandidas() ? this.marcas() : this.marcas().slice(0, this.limiteLista),
  );

  readonly kpis = computed(() => {
    const cats = this.categorias();
    const marcas = this.marcas();
    const totalCats = cats.length;
    const catsActivas = cats.filter((c) => c.activo).length;
    const totalTipos = this.tiposPlanos().length;
    const marcasActivas = marcas.filter((m) => m.activo).length;
    return {
      totalCats,
      catsActivas,
      catsInactivas: totalCats - catsActivas,
      porcentajeCatsActivas: totalCats ? ((catsActivas / totalCats) * 100).toFixed(1) : '0',
      totalTipos,
      promedioTipos: totalCats ? (totalTipos / totalCats).toFixed(1) : '0',
      totalMarcas: marcas.length,
      marcasActivas,
      marcasInactivas: marcas.length - marcasActivas,
    };
  });

  get tituloModal(): string {
    const editar = this.editId !== null;
    switch (this.modalKind) {
      case 'categoria':
        return editar ? 'Editar categoría' : 'Nueva categoría';
      case 'tipo':
        return editar ? 'Editar tipo de producto' : 'Nuevo tipo de producto';
      case 'marca':
        return editar ? 'Editar marca' : 'Agregar marca';
      default:
        return '';
    }
  }

  get labelNombre(): string {
    switch (this.modalKind) {
      case 'categoria':
        return 'Nombre de la categoría';
      case 'tipo':
        return 'Nombre del tipo';
      default:
        return 'Nombre de la marca';
    }
  }

  get placeholderNombre(): string {
    switch (this.modalKind) {
      case 'categoria':
        return 'Ej: Realidad Virtual & Simulación';
      case 'tipo':
        return 'Ej: Visores VR Autónomos';
      default:
        return 'Ej: Kingston Technology';
    }
  }

  get textoGuardar(): string {
    if (this.guardando) return 'Guardando…';
    if (this.editId !== null) return 'Guardar cambios';
    switch (this.modalKind) {
      case 'categoria':
        return 'Guardar categoría';
      case 'tipo':
        return 'Guardar tipo';
      default:
        return 'Guardar marca';
    }
  }

  ngOnInit(): void {
    this.recargar();
  }

  recargar(): void {
    this.cargando.set(true);
    this.catalogoService.obtener().subscribe({
      next: (data) => {
        this.catalogo.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }

  abrirModal(
    kind: EntidadKind,
    record?: CategoriaAdminRestDto | TipoAdminRestDto | { id: number; nombre: string },
    parentId?: number,
  ): void {
    this.modalKind = kind;
    this.editId = record?.id ?? null;
    this.nombre = record?.nombre ?? '';
    this.errorFormulario = '';
    this.categoriaSeleccionada =
      kind === 'tipo'
        ? (parentId ??
          (record as TipoAdminRestDto | undefined)?.categoriaId ??
          this.categorias()[0]?.id ??
          0)
        : 0;
    this.imagenUrl =
      kind === 'categoria'
        ? ((record as CategoriaAdminRestDto | undefined)?.imagenUrl ?? null)
        : null;
    this.imagenNombre = this.imagenUrl ? 'Imagen actual' : '';
  }

  cerrarModal(): void {
    this.modalKind = null;
    this.guardando = false;
  }

  quitarImagen(): void {
    this.imagenUrl = null;
    this.imagenNombre = '';
  }

  seleccionarImagen(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (
      !['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      this.errorFormulario = 'Elegí PNG, JPG, GIF o WebP de hasta 5 MB.';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.imagenUrl = String(reader.result);
      this.imagenNombre = file.name;
      this.errorFormulario = '';
    };
    reader.readAsDataURL(file);
  }

  guardar(): void {
    if (!this.modalKind || !this.nombre.trim()) {
      this.errorFormulario = 'El nombre es obligatorio.';
      return;
    }
    const kind = this.modalKind;
    const name = this.nombre.trim();
    this.guardando = true;
    this.errorFormulario = '';
    const request =
      kind === 'categoria'
        ? this.editId
          ? this.catalogoService.editarCategoria(this.editId, {
              nombre: name,
              imagenUrl: this.imagenUrl,
            })
          : this.catalogoService.crearCategoria({ nombre: name, imagenUrl: this.imagenUrl })
        : kind === 'tipo'
          ? this.editId
            ? this.catalogoService.editarTipo(this.editId, {
                nombre: name,
                categoriaId: this.categoriaSeleccionada,
              })
            : this.catalogoService.crearTipo({
                nombre: name,
                categoriaId: this.categoriaSeleccionada,
              })
          : this.editId
            ? this.catalogoService.editarMarca(this.editId, { nombre: name })
            : this.catalogoService.crearMarca({ nombre: name });
    request.subscribe({
      next: () => {
        this.cerrarModal();
        this.recargar();
      },
      error: (e: HttpErrorResponse) => {
        this.guardando = false;
        this.errorFormulario = e.error?.message ?? 'No se pudo guardar.';
      },
    });
  }

  pedirDeshabilitarCategoria(cat: CategoriaAdminRestDto): void {
    const tipos = cat.tipos.length;
    this.confirmacion = {
      kind: 'categoria',
      id: cat.id,
      titulo: `¿Querés deshabilitar la categoría ${cat.nombre}?`,
      descripcion:
        `Tiene ${tipos} ${tipos === 1 ? 'tipo de producto' : 'tipos de productos'} y ` +
        `${cat.cantidadProductos} ${cat.cantidadProductos === 1 ? 'producto asociado' : 'productos asociados'}. ` +
        'Al deshabilitarla, estos productos dejarán de estar disponibles en la tienda. ' +
        'Los registros y el historial de compras se conservarán.',
    };
    this.errorConfirmacion = '';
  }

  pedirDeshabilitarTipo(tipo: TipoAdminRestDto): void {
    this.confirmacion = {
      kind: 'tipo',
      id: tipo.id,
      titulo: `¿Querés deshabilitar el tipo de producto ${tipo.nombre}?`,
      descripcion:
        `Tiene ${tipo.cantidadProductos} ${tipo.cantidadProductos === 1 ? 'producto asociado' : 'productos asociados'}. ` +
        'Estos productos dejarán de estar disponibles en la tienda mientras el tipo permanezca deshabilitado. ' +
        'Los registros y el historial de compras se conservarán.',
    };
    this.errorConfirmacion = '';
  }

  pedirDeshabilitarMarca(marca: { id: number; nombre: string }): void {
    this.confirmacion = {
      kind: 'marca',
      id: marca.id,
      titulo: `¿Querés deshabilitar la marca ${marca.nombre}?`,
      descripcion:
        `Al deshabilitarla, la marca ${marca.nombre} quedará inactiva para nuevos productos. ` +
        'Los registros y el historial de compras se conservarán intactos en la base de datos.',
    };
    this.errorConfirmacion = '';
  }

  confirmarDeshabilitar(): void {
    const c = this.confirmacion;
    if (!c || this.deshabilitando) return;
    this.deshabilitando = true;
    this.errorConfirmacion = '';
    this.solicitarEstado(c.kind, c.id, false).subscribe({
      next: () => {
        this.cancelarDeshabilitar();
        this.recargar();
      },
      error: (e: HttpErrorResponse) => {
        this.deshabilitando = false;
        this.errorConfirmacion = e.error?.message ?? 'No se pudo deshabilitar. Intentá nuevamente.';
      },
    });
  }

  cancelarDeshabilitar(): void {
    this.confirmacion = null;
    this.deshabilitando = false;
    this.errorConfirmacion = '';
  }

  cambiarEstado(kind: EntidadKind, id: number, activo: boolean): void {
    this.solicitarEstado(kind, id, !activo).subscribe({
      next: () => this.recargar(),
      error: (e: HttpErrorResponse) => {
        this.error.set(true);
        console.error(e);
      },
    });
  }

  private solicitarEstado(kind: EntidadKind, id: number, nuevoEstado: boolean): Observable<unknown> {
    return kind === 'categoria'
      ? this.catalogoService.estadoCategoria(id, nuevoEstado)
      : kind === 'tipo'
        ? this.catalogoService.estadoTipo(id, nuevoEstado)
        : this.catalogoService.estadoMarca(id, nuevoEstado);
  }

  abrirReglaPadre(): void {
    this.reglaPadreAbierta = true;
  }

  cerrarReglaPadre(): void {
    this.reglaPadreAbierta = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.guardando || this.deshabilitando) return;
    if (this.modalKind) this.cerrarModal();
    if (this.confirmacion) this.cancelarDeshabilitar();
    if (this.reglaPadreAbierta) this.cerrarReglaPadre();
  }

  alternarTipos(): void {
    this.tiposExpandidos.update((v) => !v);
  }

  alternarMarcas(): void {
    this.marcasExpandidas.update((v) => !v);
  }

  estaAbierta(id: number): boolean {
    return this.abiertas().has(id);
  }

  alternar(id: number): void {
    const copia = new Set(this.abiertas());
    if (copia.has(id)) copia.delete(id);
    else copia.add(id);
    this.abiertas.set(copia);
  }

  tiposActivos(c: CategoriaAdminRestDto): number {
    return c.tipos.filter((t) => t.activo).length;
  }
}
