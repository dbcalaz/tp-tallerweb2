import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { CategoriasAdminComponent } from './pages/categorias-admin/categorias-admin.component';
import { ProductosAdminComponent } from './pages/productos-admin/productos-admin.component';

export const adminRoutes: Routes = [
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'productos' },
      { path: 'productos', component: ProductosAdminComponent },
      { path: 'categorias', component: CategoriasAdminComponent },
    ],
  },
];
