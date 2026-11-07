import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { tap } from 'rxjs';

export const httpLoggerInterceptor: HttpInterceptorFn = (req, next) => {
  const started = Date.now();
  const time = new Date().toLocaleTimeString('es-AR', { hour12: false });
  console.log(`%c[HTTP REQ] ${time} -> ${req.method} ${req.urlWithParams}`, 'color: #3b82f6; font-weight: bold;', req.body ?? '');

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const elapsed = Date.now() - started;
          console.log(
            `%c[HTTP RES] ${time} <- ${req.method} ${req.urlWithParams} [${event.status}] (${elapsed}ms)`,
            'color: #10b981; font-weight: bold;',
            event.body
          );
        }
      },
      error: (error: unknown) => {
        const elapsed = Date.now() - started;
        if (error instanceof HttpErrorResponse) {
          console.error(
            `%c[HTTP ERR] ${time} <- ${req.method} ${req.urlWithParams} [${error.status}] (${elapsed}ms)`,
            'color: #ef4444; font-weight: bold;',
            error
          );
        } else {
          console.error(`%c[HTTP ERR] ${time} <- ${req.method} ${req.urlWithParams} (${elapsed}ms)`, 'color: #ef4444;', error);
        }
      },
    })
  );
};

