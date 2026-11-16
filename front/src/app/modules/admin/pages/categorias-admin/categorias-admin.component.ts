import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AdminHeaderComponent } from '../../components/admin-header/admin-header.component';
import { CatalogoAdminService } from '../../../../api/services/catalogo/catalogo-admin.service';
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
  imports: [AdminHeaderComponent],
  templateUrl: './categoria-admin.component.html',
})
export class CategoriasAdminComponent implements OnInit {
  private readonly catalogoService = inject(CatalogoAdminService);

  readonly catalogo = signal<CatalogoAdminRestDto | null>(null);
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly abiertas = signal<ReadonlySet<number>>(new Set());

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
