import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthSessionService } from './features/users/data-access/auth-session.service';
import { ToastService } from './shared/toast.service';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  styleUrl: '../styles/app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  protected readonly authSession = inject(AuthSessionService);
  protected readonly toast = inject(ToastService);

  protected logout(): void {
    this.authSession.clear();
    void this.router.navigateByUrl('/login');
  }
}
