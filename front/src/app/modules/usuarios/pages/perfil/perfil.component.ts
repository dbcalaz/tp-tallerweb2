import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ActualizarPerfilRequestDto, PerfilUsuarioResponseDto } from '../../../../api/dto/usuario.dto';
import { AuthSessionService } from '../../../../api/services/auth/auth-session.service';
import { CarritoService } from '../../../../api/services/carrito/carrito.service';
import { UsuariosService } from '../../../../api/services/usuarios/usuarios.service';
import { ToastService } from '../../../../shared/toast.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent implements OnInit {
  protected readonly authSession = inject(AuthSessionService);
  protected readonly carritoService = inject(CarritoService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly perfil = signal<PerfilUsuarioResponseDto | null>(null);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly seccionActiva = signal<'datos' | 'compras'>('datos');

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
          this.toast.showSuccess('No se pudo cargar el perfil.');
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
          this.authSession.start({
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
          this.toast.showSuccess('Error al actualizar los datos. Intentá nuevamente.');
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
