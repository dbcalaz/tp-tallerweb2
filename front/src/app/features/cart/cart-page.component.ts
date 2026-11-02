import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.css'
})
export class CartPageComponent {
  isOpen = signal(false);

  openCart(): void {
    console.log('ABRIENDO CARRITO');
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeCart(): void {
    this.isOpen.set(false);
    document.body.style.overflow = '';
  }
}
