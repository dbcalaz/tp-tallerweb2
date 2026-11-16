import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from '../../api/services/auth/auth-session.service';

export const adminGuard: CanActivateFn = () => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  if (authSession.isAdmin()) return true;

  return router.createUrlTree([authSession.isAuthenticated() ? '/productos' : '/login']);
};
