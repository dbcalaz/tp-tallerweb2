import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string | null;
  stock: number;
  activo: boolean;
  tipoProducto: {
    id: number;
    nombre: string;
    categoria: {
      id: number;
      nombre: string;
    };
  };
  marca: {
    id: number;
    nombre: string;
  };
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  cantidad: number;
  producto: Producto;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse {
  cart: Cart;
}

export interface AddToCartData {
  userId: number;
  productId: number;
  cantidad: number;
}

export interface RemoveFromCartData {
  userId: number;
  productId: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly cartSignal = signal<Cart | null>(null);

  readonly cart = this.cartSignal.asReadonly();
  readonly items = computed(() => this.cartSignal()?.items ?? []);
  readonly itemCount = computed(() =>
    this.items().reduce((total, item) => total + item.cantidad, 0)
  );
  readonly isEmpty = computed(() => this.items().length === 0);

  private setCartState(cart: Cart | null): void {
    if (!cart) {
      this.cartSignal.set(null);
      return;
    }

    this.cartSignal.set({
      ...cart,
      items: cart.items.map(item => ({
        ...item,
        producto: { ...item.producto }
      }))
    });
  }

  getCart(userId: number): Observable<CartResponse> {
    return this.http.get<CartResponse>(`/api/carrito?userId=${userId}`);
  }

  addToCart(data: AddToCartData): Observable<CartResponse> {
    return this.http.post<CartResponse>('/api/carrito/agregar', data).pipe(
      tap((response) => {
        if (response?.cart) {
          this.setCartState(response.cart);
        } else {
          this.loadCart(data.userId);
        }
      })
    );
  }

  removeFromCart(data: RemoveFromCartData): Observable<CartResponse> {
    return this.http.post<CartResponse>('/api/carrito/eliminar', data);
  }

  updateQuantity(data: AddToCartData): Observable<CartResponse> {
    return this.http.post<CartResponse>('/api/carrito/actualizar-cantidad', data);
  }

  loadCart(userId: number): void {
    this.getCart(userId).subscribe({
      next: (response) => this.setCartState(response.cart),
      error: (error) => console.error('Error al cargar carrito:', error),
    });
  }

  addProduct(data: AddToCartData): Observable<CartResponse> {
    return this.addToCart(data);
  }

  addProductAndUpdate(data: AddToCartData): void {
    this.addToCart(data).subscribe({
      error: (error) => console.error('Error al agregar producto:', error),
    });
  }

  removeProduct(data: RemoveFromCartData): void {
    this.removeFromCart(data).subscribe({
      next: (response) => this.setCartState(response.cart),
      error: (error) => console.error('Error al eliminar producto:', error),
    });
  }

  updateItemQuantity(data: AddToCartData): void {
    this.updateQuantity(data).subscribe({
      next: (response) => this.setCartState(response.cart),
      error: (error) => console.error('Error al actualizar cantidad:', error),
    });
  }

  clearCart(): void {
    this.setCartState(null);
  }
}