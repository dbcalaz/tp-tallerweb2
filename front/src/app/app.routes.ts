import { Routes } from '@angular/router';
import { HomeComponent } from './public/home/home.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'productos', pathMatch: 'full', component: HomeComponent },
  {
    path: '',
    loadChildren: () => import('./modules/usuarios/usuarios.routes').then((m) => m.usuariosRoutes),
  },
  {
    path: '',
    loadChildren: () => import('./modules/productos/productos.routes').then((m) => m.productosRoutes),
  },
  {
    path: '',
    loadChildren: () => import('./modules/carrito/carrito.routes').then((m) => m.carritoRoutes),
  },
  { path: '**', redirectTo: 'login' },
];
