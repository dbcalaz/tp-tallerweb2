import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthSessionService } from '../../../../api/services/auth/auth-session.service';

@Component({
  selector: 'app-admin-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-header.component.html',
})
export class AdminHeaderComponent {
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);

  protected cerrarSesion(): void {
    this.authSession.clear();
    void this.router.navigateByUrl('/login');
  }
}
