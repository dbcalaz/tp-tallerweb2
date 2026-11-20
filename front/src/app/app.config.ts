import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeEsAr from '@angular/common/locales/es-AR';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';
import { httpLoggerInterceptor } from './core/http-logger.interceptor';
import { loadingInterceptor } from './core/loading.interceptor';

registerLocaleData(localeEsAr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor, loadingInterceptor, httpLoggerInterceptor])),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }), // Esto es para que cuando navegue, vuelva al tope de la página,
    ),
    { provide: LOCALE_ID, useValue: 'es-AR' },
  ],
};
