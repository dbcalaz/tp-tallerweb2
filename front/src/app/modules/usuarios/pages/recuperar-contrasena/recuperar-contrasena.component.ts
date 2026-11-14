import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { UsuariosService } from '../../../../api/services/usuarios/usuarios.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-recuperar-contrasena',
  styleUrl: '../../../../../styles/signup.css',
  templateUrl: './recuperar-contrasena.component.html',
})
export class RecuperarContrasenaComponent {
  private readonly usersApi = inject(UsuariosService);
  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  protected submit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.usersApi.solicitarRecuperacion(this.form.controls.email.value).pipe(
      timeout({ first: 20000 }),
      finalize(() => this.isSubmitting.set(false)),
    ).subscribe({
      next: (response) => this.successMessage.set(response.message),
      error: (error: unknown) => {
        const timedOut = error instanceof Error && error.name === 'TimeoutError';
        const httpError = error instanceof HttpErrorResponse ? error : null;
        this.errorMessage.set(timedOut
          ? 'El servidor tardó demasiado en responder. Intentá nuevamente.'
          : httpError?.status === 0
            ? 'No se pudo conectar con el servidor. Verificá que esté iniciado.'
            : (httpError?.error as { message?: string } | null)?.message || 'No se pudo iniciar la recuperación. Intentá nuevamente.');
      },
    });
  }
}
