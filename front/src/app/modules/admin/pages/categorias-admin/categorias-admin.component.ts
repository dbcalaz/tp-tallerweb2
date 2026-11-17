import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AdminHeaderComponent } from '../../components/admin-header/admin-header.component';
import { CatalogoAdminService } from '../../../../api/services/catalogo/catalogo-admin.service';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import {
  CatalogoAdminRestDto,
  CategoriaAdminRestDto,
  TipoAdminRestDto,
} from '../../../../api/dto/catalogo-admin.dto';

interface TipoPlano extends TipoAdminRestDto {
  categoriaNombre: string;
  habilitado: boolean; // tipo.activo && categoria.activo
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
  modalKind: 'categoria' | 'tipo' | 'marca' | null = null;
  editId: number | null = null;
  categoriaSeleccionada = 0;
  nombre = '';
  imagenUrl: string | null = null;
  imagenNombre = '';
  errorFormulario = '';
  guardando = false;

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

  abrirModal(kind: 'categoria' | 'tipo' | 'marca', record?: CategoriaAdminRestDto | TipoAdminRestDto | { id: number; nombre: string }, parentId?: number): void {
    this.modalKind = kind; this.editId = record?.id ?? null; this.nombre = record?.nombre ?? ''; this.errorFormulario = '';
    this.categoriaSeleccionada = kind === 'tipo' ? (parentId ?? (record as TipoAdminRestDto | undefined)?.categoriaId ?? this.categorias()[0]?.id ?? 0) : 0;
    this.imagenUrl = kind === 'categoria' ? (record as CategoriaAdminRestDto | undefined)?.imagenUrl ?? null : null;
    this.imagenNombre = this.imagenUrl ? 'Imagen actual' : '';
  }

  cerrarModal(): void { this.modalKind = null; this.guardando = false; }

  seleccionarImagen(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024) { this.errorFormulario = 'Elegí PNG, JPG, GIF o WebP de hasta 5 MB.'; return; }
    const reader = new FileReader(); reader.onload = () => { this.imagenUrl = String(reader.result); this.imagenNombre = file.name; this.errorFormulario = ''; }; reader.readAsDataURL(file);
  }

  guardar(): void {
    if (!this.modalKind || !this.nombre.trim()) { this.errorFormulario = 'El nombre es obligatorio.'; return; }
    const kind = this.modalKind; const name = this.nombre.trim(); this.guardando = true; this.errorFormulario = '';
    const request = kind === 'categoria'
      ? (this.editId ? this.catalogoService.editarCategoria(this.editId, { nombre: name, imagenUrl: this.imagenUrl }) : this.catalogoService.crearCategoria({ nombre: name, imagenUrl: this.imagenUrl }))
      : kind === 'tipo'
        ? (this.editId ? this.catalogoService.editarTipo(this.editId, { nombre: name, categoriaId: this.categoriaSeleccionada }) : this.catalogoService.crearTipo({ nombre: name, categoriaId: this.categoriaSeleccionada }))
        : (this.editId ? this.catalogoService.editarMarca(this.editId, { nombre: name }) : this.catalogoService.crearMarca({ nombre: name }));
    request.subscribe({ next: () => { this.cerrarModal(); this.recargar(); }, error: (e: HttpErrorResponse) => { this.guardando = false; this.errorFormulario = e.error?.message ?? 'No se pudo guardar.'; } });
  }

  cambiarEstado(kind: 'categoria' | 'tipo' | 'marca', id: number, activo: boolean): void {
    const request = kind === 'categoria' ? this.catalogoService.estadoCategoria(id, !activo) : kind === 'tipo' ? this.catalogoService.estadoTipo(id, !activo) : this.catalogoService.estadoMarca(id, !activo);
    request.subscribe({ next: () => this.recargar(), error: (e: HttpErrorResponse) => { this.error.set(true); console.error(e); } });
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
