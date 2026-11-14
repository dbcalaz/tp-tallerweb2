
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthSessionService } from './api/services/auth/auth-session.service';
import { ToastService } from './shared/toast.service';
import { Navbar } from './public/navbar/navbar';
import { FooterComponent } from './public/footer/footer.component';

@Component({
  imports: [ RouterOutlet, Navbar, FooterComponent, RouterLink],
  selector: 'app-root',
  styleUrl: '../styles/app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  protected readonly authSession = inject(AuthSessionService);
  protected readonly toast = inject(ToastService);
}
