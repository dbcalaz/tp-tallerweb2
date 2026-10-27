import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', loadComponent: () => import('./features/users/login/login.component').then((module) => module.LoginComponent) },
  {
    path: 'usuarios/registro',
    loadComponent: () => import('./features/users/signup/signup.component').then((module) => module.SignupComponent),
  },
  {
    path: 'productos',
    loadComponent: () => import('./features/products/products-page.component').then((module) => module.ProductsPageComponent),
  },
  {
    path: 'carrito',
    loadComponent: () => import('./features/cart/cart-page.component').then((module) => module.CartPageComponent),
  },
  { path: '**', redirectTo: 'login' },
];
