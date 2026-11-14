import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RegistroRequestDto } from '../../../../api/dto/usuario.dto';
import { UsuariosService } from '../../../../api/services/usuarios/usuarios.service';
import { finalize, timeout } from 'rxjs';
import { Router } from '@angular/router';
import { AuthSessionService } from '../../../../api/services/auth/auth-session.service';
import { ToastService } from '../../../../shared/toast.service';

interface RegistrationError {
  message?: string;
  fieldErrors?: Record<string, string>;
}

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-registro',
  styleUrl: '../../../../../styles/signup.css',
  templateUrl: './registro.component.html',
})
export class RegistroComponent {
  private readonly usersApi = inject(UsuariosService);
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);
  private readonly toast = inject(ToastService);

  private readonly passwordComplexity: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');
    if (!value) return null;

    const meetsRequirements =
      value.length >= 8 &&
      /[a-z]/.test(value) &&
      /[A-Z]/.test(value) &&
      /\d/.test(value) &&
      /[^A-Za-z0-9]/.test(value);

    return meetsRequirements ? null : { passwordComplexity: true };
  };

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8), this.passwordComplexity],
    }),
    passwordConfirmation: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    apellido: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    direccion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    termsAccepted: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
  }, { validators: (group) => group.get('password')?.value === group.get('passwordConfirmation')?.value ? null : { passwordMismatch: true } });

  protected isSubmitting = false;
  protected showPassword = false;
  protected showPasswordConfirmation = false;
  protected errorMessage = '';
  protected serverErrors: Record<string, string> = {};

  protected submit(): void {
    this.errorMessage = '';
    this.serverErrors = {};

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { email, password, nombre, apellido, direccion } = this.form.getRawValue();
    this.usersApi.register(new RegistroRequestDto(email, password, nombre, apellido, direccion)).pipe(
      timeout({ first: 10000 }),
      finalize(() => this.isSubmitting = false),
    ).subscribe({
      next: (response) => {
        this.authSession.start(response.user);
        this.form.reset();
        this.toast.showSuccess('Te registraste correctamente.');
        void this.router.navigateByUrl('/productos');
      },
      error: (error: unknown) => {
        const timedOut = error instanceof Error && error.name === 'TimeoutError';
        const httpError = error instanceof HttpErrorResponse ? error : null;
        const response = httpError?.error as RegistrationError | null;
        this.errorMessage = timedOut
          ? 'El servidor tardó demasiado en responder. Verificá que esté iniciado e intentá nuevamente.'
          : httpError?.status === 0
            ? 'No se pudo conectar con el servidor. Verificá que esté iniciado e intentá nuevamente.'
            : response?.message || 'No se pudo completar el registro. Intentá nuevamente.';
        this.serverErrors = response?.fieldErrors || {};
      },
    });
  }

  protected clearServerError(field: string): void {
    delete this.serverErrors[field];
    this.serverErrors = { ...this.serverErrors };
  }

}
