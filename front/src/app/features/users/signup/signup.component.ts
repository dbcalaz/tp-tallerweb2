import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UsersApiService } from '../data-access/users-api.service';
import { finalize, timeout } from 'rxjs';
import { Router } from '@angular/router';
import { AuthSessionService } from '../data-access/auth-session.service';
import { ToastService } from '../../../shared/toast.service';

interface RegistrationError {
  message?: string;
  fieldErrors?: Record<string, string>;
}

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-signup',
  styleUrl: './signup.component.css',
  templateUrl: './signup.component.html',
})
export class SignupComponent {
  private readonly usersApi = inject(UsersApiService);
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
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    apellido: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    direccion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected isSubmitting = false;
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
    this.usersApi.register(this.form.getRawValue()).pipe(
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
