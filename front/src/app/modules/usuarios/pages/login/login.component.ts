import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { LoginRequestDto } from '../../../../api/dto/usuario.dto';
import { UsuariosService } from '../../../../api/services/usuarios/usuarios.service';
import { AuthSessionService } from '../../../../api/services/auth/auth-session.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: '../../../../../styles/signup.css',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly usersApi = inject(UsuariosService);
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);
  protected isSubmitting = false;
  protected showPassword = false;
  protected errorMessage = '';
  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected submit(): void {
    this.errorMessage = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSubmitting = true;
    const { email, password } = this.form.getRawValue();
    this.usersApi.login(new LoginRequestDto(email, password)).pipe(
      timeout({ first: 10000 }),
      finalize(() => this.isSubmitting = false),
    ).subscribe({
      next: (response) => {
        this.authSession.start(response.user);
        void this.router.navigateByUrl('/productos');
      },
      error: (error: unknown) => {
        const timedOut = error instanceof Error && error.name === 'TimeoutError';
        const httpError = error instanceof HttpErrorResponse ? error : null;
        const serverMessage = (httpError?.error as { message?: string } | null)?.message;

        this.errorMessage = timedOut
          ? 'El servidor tardó demasiado en responder. Intentá nuevamente.'
          : httpError?.status === 0
            ? 'No se pudo conectar con el servidor. Verificá que esté iniciado.'
            : serverMessage || 'El email o la contraseña no coinciden.';
      },
    });
  }
}
