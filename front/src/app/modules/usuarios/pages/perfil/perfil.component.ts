import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ActualizarPerfilRequestDto, PerfilUsuarioResponseDto } from '../../../../api/dto/usuario.dto';
import { AuthSessionService } from '../../../../api/services/auth/auth-session.service';
import { CarritoService } from '../../../../api/services/carrito/carrito.service';
import { UsuariosService } from '../../../../api/services/usuarios/usuarios.service';
import { ToastService } from '../../../../shared/toast.service';
import { FavoritosService } from '../../../../api/services/productos/favoritos.service';
import { CardProductoComponent } from '../../../productos/components/card-producto/card-producto.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, CardProductoComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent implements OnInit {
  protected readonly authSession = inject(AuthSessionService);
  protected readonly carritoService = inject(CarritoService);
  protected readonly favoritosService = inject(FavoritosService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly perfil = signal<PerfilUsuarioResponseDto | null>(null);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly seccionActiva = signal<'datos' | 'compras' | 'favoritos'>('datos');
  readonly paginaFavoritos = signal(1);
  readonly favoritosPorPagina = 6;
  readonly totalPaginasFavoritos = computed(() => Math.max(1, Math.ceil(this.favoritosService.productos().length / this.favoritosPorPagina)));
  readonly paginaFavoritosActual = computed(() => Math.min(this.paginaFavoritos(), this.totalPaginasFavoritos()));
  readonly paginasFavoritos = computed(() => {
    const total = this.totalPaginasFavoritos();
    const current = this.paginaFavoritosActual();
    const start = Math.max(1, Math.min(current - 2, total - 4));
    return Array.from({ length: Math.min(5, total) }, (_, index) => start + index);
  });
  readonly productosFavoritosPagina = computed(() => {
    const inicio = (this.paginaFavoritosActual() - 1) * this.favoritosPorPagina;
    return this.favoritosService.productos().slice(inicio, inicio + this.favoritosPorPagina);
  });

  cambiarPaginaFavoritos(pagina: number): void {
    this.paginaFavoritos.set(Math.max(1, Math.min(pagina, this.totalPaginasFavoritos())));
  }

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    email: [{ value: '', disabled: true }],
    direccion: ['', [Validators.required, Validators.minLength(4)]],
  });

  ngOnInit(): void {
    const user = this.authSession.currentUser();
    if (!user?.id) return;

    this.cargarDatosPerfil(user.id);
  }

  cargarDatosPerfil(userId: string | number): void {
    this.cargando.set(true);
    this.usuariosService
      .getPerfil(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.perfil.set(data);
          this.form.patchValue({
            nombre: data.nombre,
            apellido: data.apellido,
            email: data.email,
            direccion: data.direccion,
          });
          this.cargando.set(false);
        },
        error: (err) => {
          console.error('Error al cargar perfil:', err);
          this.cargando.set(false);
          this.toast.showError('No se pudo cargar el perfil.');
        },
      });
  }

  guardarCambios(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.authSession.currentUser();
    if (!user?.id) return;

    this.guardando.set(true);
    const { nombre, apellido, direccion } = this.form.getRawValue();
    const dto = new ActualizarPerfilRequestDto(nombre, apellido, direccion);

    this.usuariosService
      .updatePerfil(user.id, dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.guardando.set(false);
          this.toast.showSuccess('Tus datos se actualizaron correctamente');
          this.authSession.updateUser({
            ...user,
            nombre: res.user.nombre,
            apellido: res.user.apellido,
            direccion: res.user.direccion,
          });

          const actual = this.perfil();
          if (actual) {
            this.perfil.set({
              ...actual,
              nombre: res.user.nombre,
              apellido: res.user.apellido,
              direccion: res.user.direccion ?? actual.direccion,
            });
          }
        },
        error: () => {
          this.guardando.set(false);
          this.toast.showError('Error al actualizar los datos. Intentá nuevamente.');
        },
      });
  }

  cerrarSesion(): void {
    this.authSession.clear();
    void this.router.navigateByUrl('/login');
  }

  abrirCarrito(): void {
    this.carritoService.abrirCarrito();
  }
}
