import { Component, HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-scroll-top',
  standalone: true,
  template: `
    @if (visible()) {
      <button
        type="button"
        aria-label="Volver arriba"
        title="Volver arriba"
        (click)="scrollToTop()"
        class="fixed bottom-5 right-5 z-[900] flex h-11 w-11 items-center justify-center rounded-full bg-[#0b1721] text-white shadow-lg ring-1 ring-white/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4f1800] active:scale-95 cursor-pointer"
      >
        <span class="material-symbols-outlined text-[22px]">keyboard_arrow_up</span>
      </button>
    }
  `,
})
export class ScrollTopComponent {
  readonly visible = signal(false);

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.visible.set(window.scrollY > 320);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
