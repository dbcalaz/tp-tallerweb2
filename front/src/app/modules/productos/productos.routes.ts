import { Routes } from '@angular/router';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';
import { DetalleProductoComponent } from './pages/detalle-producto/detalle-producto.component';

export const productosRoutes: Routes = [
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'productos/detalle', component: DetalleProductoComponent },
];
