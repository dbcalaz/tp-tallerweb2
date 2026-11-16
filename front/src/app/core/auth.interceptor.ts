import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthSessionService } from '../api/services/auth/auth-session.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  const token = authSession.token();
  const esApi = req.url.startsWith(environment.API_URL);
  const request = token && esApi ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      if (token && esApi && error instanceof HttpErrorResponse && error.status === 401) {
        authSession.clear();
        void router.navigateByUrl('/login');
      }
      return throwError(() => error);
    }),
  );
};
