import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { CatalogoAdminService } from '../../../../api/services/catalogo/catalogo-admin.service';
import { ProductosAdminService } from '../../../../api/services/productos/productos-admin.service';
import { CategoriaAdminRestDto, CatalogoAdminRestDto, MarcaAdminRestDto } from '../../../../api/dto/catalogo-admin.dto';
import { ProductoRestDto } from '../../../../api/dto/producto.dto';
import { AdminHeaderComponent } from '../../components/admin-header/admin-header.component';
import { ToastService } from '../../../../shared/toast.service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, RouterLink, AdminHeaderComponent],
  templateUrl: './producto-form.component.html',
})
export class ProductoFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogoApi = inject(CatalogoAdminService);
  private readonly productosApi = inject(ProductosAdminService);
  private readonly toast = inject(ToastService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  protected readonly id = Number(this.route.snapshot.paramMap.get('id')) || null;
  protected catalogo: CatalogoAdminRestDto = { categorias: [], marcas: [] };
  protected producto: ProductoRestDto | null = null;
  protected nombre = '';
  protected descripcion = '';
  protected precio: number | null = null;
  protected stock: number | null = null;
  protected categoriaId = 0;
  protected tipoProductoId = 0;
  protected marcaId = 0;
  protected imagenUrl: string | null = null;
  protected imagenNombre = '';
  protected cargando = true;
  protected guardando = false;
  protected error = '';
  protected readonly rubroSuggested = ['apple-silicon', 'hot-swap', 'pcie-5.0', 'ips-black'];

  protected get categoriasActivas(): CategoriaAdminRestDto[] { return this.catalogo.categorias.filter((category) => category.activo || category.id === this.categoriaId); }
  protected get tiposActivos() { return this.categoriasActivas.find((category) => category.id === this.categoriaId)?.tipos.filter((type) => type.activo || type.id === this.tipoProductoId) ?? []; }
  protected get marcasActivas(): MarcaAdminRestDto[] { return this.catalogo.marcas.filter((brand) => brand.activo || brand.id === this.marcaId); }
  protected get tipoElegido(): string { return this.tiposActivos.find((type) => type.id === this.tipoProductoId)?.nombre ?? 'Seleccionar tipo…'; }
  protected get marcaElegida(): string { return this.marcasActivas.find((brand) => brand.id === this.marcaId)?.nombre ?? 'Sin seleccionar'; }

  ngOnInit(): void {
    this.catalogoApi.obtenerOpciones().pipe(timeout({ first: 15000 })).subscribe({
      next: (data) => {
        this.catalogo = data;
        if (!this.id) { this.cargando = false; this.changeDetector.markForCheck(); return; }
        this.cargarProducto(this.id);
      },
      error: () => { this.error = 'No se pudieron cargar categorías y marcas. Revisá la conexión con el servidor e intentá nuevamente.'; this.cargando = false; this.changeDetector.markForCheck(); },
    });
  }

  protected cambiarCategoria(raw: string | number): void {
    this.categoriaId = Number(raw); this.tipoProductoId = 0;
  }

  private cargarProducto(id: number): void {
    this.productosApi.obtenerPorId(id).pipe(timeout({ first: 15000 }), finalize(() => this.cargando = false)).subscribe({
      next: (product) => {
        this.producto = product; this.nombre = product.nombre; this.descripcion = product.descripcion ?? '';
        this.precio = Number(product.precio); this.stock = product.stock; this.imagenUrl = product.imagenUrl;
        this.marcaId = product.marca?.id ?? 0; this.tipoProductoId = product.tipoProducto?.id ?? 0;
        this.categoriaId = product.tipoProducto?.categoriaId ?? 0; this.imagenNombre = product.imagenUrl ? 'Imagen actual' : '';
        this.cargando = false; this.changeDetector.markForCheck();
      },
      error: () => { this.error = 'No se pudo cargar el producto.'; this.cargando = false; this.changeDetector.markForCheck(); },
    });
  }

  protected seleccionarImagen(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      this.error = 'Usá una imagen PNG, JPG o WebP de hasta 5 MB.'; return;
    }
    const reader = new FileReader(); reader.onload = () => { this.imagenUrl = String(reader.result); this.imagenNombre = file.name; this.error = ''; this.changeDetector.markForCheck(); };
    reader.readAsDataURL(file);
  }

  protected guardar(publicar: boolean): void {
    if (!this.nombre.trim() || !this.categoriaId || !this.tipoProductoId || !this.marcaId || !this.precio || this.precio <= 0 || this.stock === null || this.stock < 0) {
      this.error = 'Completá nombre, categoría, tipo, marca, precio y stock con valores válidos.'; return;
    }
    const payload = { nombre: this.nombre.trim(), descripcion: this.descripcion.trim(), precio: Number(this.precio), stock: Number(this.stock), imagenUrl: this.imagenUrl, marcaId: Number(this.marcaId), tipoProductoId: Number(this.tipoProductoId), activo: this.id ? (this.producto?.activo ?? true) : publicar };
    this.guardando = true; this.error = '';
    const request = this.id ? this.productosApi.actualizar(this.id, payload) : this.productosApi.crear(payload);
    request.pipe(finalize(() => { this.guardando = false; this.changeDetector.markForCheck(); })).subscribe({
      next: (product) => {
        this.toast.showSuccess(this.id ? 'Los cambios del producto se guardaron.' : (publicar ? 'El producto se creó y quedó activo.' : 'El producto se guardó como borrador.'));
        void this.router.navigateByUrl('/admin/productos');
      },
      error: (e) => { this.error = e.error?.message ?? 'No se pudo guardar el producto.'; this.changeDetector.markForCheck(); },
    });
  }
}
