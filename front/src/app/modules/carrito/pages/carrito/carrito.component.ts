import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent {
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
