import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthSessionService } from '../../features/users/data-access/auth-session.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly router = inject(Router);
  protected readonly authSession = inject(AuthSessionService);

  protected logout(): void {
    this.authSession.clear();
    void this.router.navigateByUrl('/login');
  }
}
