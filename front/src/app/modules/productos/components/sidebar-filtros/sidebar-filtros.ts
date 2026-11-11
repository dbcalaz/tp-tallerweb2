import { Component, computed, input, output } from '@angular/core';
import { CategoriaFiltro, OpcionFiltro } from '../../interfaces/filtros.interface';

@Component({
  selector: 'app-sidebar-filtros',
  templateUrl: './sidebar-filtros.html',
  styleUrl: './sidebar-filtros.css',
})
export class SidebarFiltrosComponent {
  // Entradas: lo que el padre le pasa
  modoCategoria = input.required<boolean>();
  categorias = input.required<CategoriaFiltro[]>();
  tipos = input.required<OpcionFiltro[]>();
  marcas = input.required<OpcionFiltro[]>();
  categoriasSel = input.required<number[]>();
  tiposSel = input.required<number[]>();
  marcasSel = input.required<number[]>();

  // Salidas: lo que le avisa al padre
  categoriaToggle = output<number>();
  tipoToggle = output<number>();
  marcaToggle = output<number>();
  limpiar = output<void>();

  protected readonly cantidadActivos = computed(
    () => this.categoriasSel().length + this.tiposSel().length + this.marcasSel().length,
  );
}
