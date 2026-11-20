import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthSessionService } from './api/services/auth/auth-session.service';
import { FooterComponent } from './public/footer/footer.component';
import { Navbar } from './public/navbar/navbar';
import { LoadingService } from './shared/loading.service';
import { ScrollTopComponent } from './shared/scroll-top/scroll-top.component';
import { ToastService } from './shared/toast.service';

@Component({
  imports: [RouterOutlet, Navbar, FooterComponent, RouterLink, ScrollTopComponent],
  selector: 'app-root',
  styleUrl: '../styles/app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly authSession = inject(AuthSessionService);
  protected readonly toast = inject(ToastService);
  protected readonly loading = inject(LoadingService);
}
