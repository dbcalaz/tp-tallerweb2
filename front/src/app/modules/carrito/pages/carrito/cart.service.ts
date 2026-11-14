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
  carritoId: number;
  productoId: number;
  cantidad: number;
  createdAt: string;
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
  carrito: Cart;
}

export interface AddToCartData {
  userId: number;
  productoId: number;
  cantidad: number;
}

export interface RemoveFromCartData {
  userId: number;
  productoId: number;
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

  private setCartState(carrito: Cart | null): void {
    if (!carrito) {
      this.cartSignal.set(null);
      return;
    }

    this.cartSignal.set({
      ...carrito,
      items: carrito.items.map(item => ({
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
        if (response?.carrito) {
          this.setCartState(response.carrito);
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
      next: (response) => this.setCartState(response.carrito),
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
      next: (response) => this.setCartState(response.carrito),
      error: (error) => console.error('Error al eliminar producto:', error),
    });
  }

  updateItemQuantity(data: AddToCartData): void {
    this.updateQuantity(data).subscribe({
      next: (response) => this.setCartState(response.carrito),
      error: (error) => console.error('Error al actualizar cantidad:', error),
    });
  }

  clearCart(userId?: number): void {
    if (!userId) {
      this.setCartState(null);
      return;
    }

    this.http.post<CartResponse>('/api/carrito/vaciar', { userId }).subscribe({
      next: (response) => this.setCartState(response.carrito),
      error: (error) => console.error('Error al vaciar carrito:', error),
    });
  }
}