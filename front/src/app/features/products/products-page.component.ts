import { Component } from '@angular/core';

@Component({
  selector: 'app-products-page',
  template: `
    <main class="placeholder-page">
      <p class="eyebrow">Catálogo</p>
      <h1>Productos</h1>
      <p>Esta sección queda preparada para el catálogo de productos.</p>
    </main>
  `,
  styles: [`
    .placeholder-page { max-width: 50rem; margin: 0 auto; padding: 4rem 1.5rem; color: #536079; }
    h1 { margin: 0.3rem 0 0.75rem; color: #172033; font-size: 2rem; }
    .eyebrow { color: #3156a5; font-size: 0.78rem; font-weight: 750; letter-spacing: 0.1em; text-transform: uppercase; }
  `],
})
export class ProductsPageComponent {}