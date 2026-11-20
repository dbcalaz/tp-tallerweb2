import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly router = inject(Router);
  private readonly activeRequests = signal(0);
  private readonly navigating = signal(false);

  readonly isLoading = computed(() => this.activeRequests() > 0 || this.navigating());

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.navigating.set(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.navigating.set(false);
      }
    });
  }

  startRequest(): void {
    this.activeRequests.update((n) => n + 1);
  }

  endRequest(): void {
    this.activeRequests.update((n) => Math.max(0, n - 1));
  }
}
