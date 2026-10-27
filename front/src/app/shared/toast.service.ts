import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private timeoutId: ReturnType<typeof setTimeout> | undefined;
  readonly message = signal('');

  showSuccess(message: string, durationMs = 4000): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.message.set(message);
    this.timeoutId = setTimeout(() => {
      this.message.set('');
      this.timeoutId = undefined;
    }, durationMs);
  }
}
