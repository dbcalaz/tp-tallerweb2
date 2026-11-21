import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private timeoutId: ReturnType<typeof setTimeout> | undefined;
  readonly message = signal('');
  readonly kind = signal<ToastKind>('success');

  showSuccess(message: string, durationMs = 2800): void {
    this.show('success', message, durationMs);
  }

  showError(message: string, durationMs = 4500): void {
    this.show('error', message, durationMs);
  }

  dismiss(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
    this.message.set('');
  }

  private show(kind: ToastKind, message: string, durationMs: number): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.kind.set(kind);
    this.message.set(message);
    this.timeoutId = setTimeout(() => {
      this.message.set('');
      this.timeoutId = undefined;
    }, durationMs);
  }
}
