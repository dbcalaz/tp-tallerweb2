import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { UsuariosService } from '../../../../api/services/usuarios/usuarios.service';

const passwordComplexity: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = String(control.value ?? '');
  if (!password) return null;
  const valid = password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password)
    && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
  return valid ? null : { passwordComplexity: true };
};

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-restablecer-contrasena',
  styleUrl: '../../../../../styles/signup.css',
  templateUrl: './restablecer-contrasena.component.html',
})
export class RestablecerContrasenaComponent {
  private readonly usersApi = inject(UsuariosService);
  protected readonly token = inject(ActivatedRoute).snapshot.queryParamMap.get('token') ?? '';
  protected readonly form = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, passwordComplexity] }),
    confirmation: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  }, {
    validators: (group) => group.get('password')?.value === group.get('confirmation')?.value
      ? null
      : { passwordMismatch: true },
  });
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  protected submit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    if (!this.token) {
      this.errorMessage.set('El enlace de recuperación no es válido. Solicitá uno nuevo.');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.usersApi.restablecerPassword(this.token, this.form.controls.password.value).pipe(
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
            : (httpError?.error as { message?: string } | null)?.message || 'No se pudo cambiar la contraseña.');
      },
    });
  }
}
