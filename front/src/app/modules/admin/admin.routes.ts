import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { CategoriasAdminComponent } from './pages/categorias-admin/categorias-admin.component';
import { ProductosAdminComponent } from './pages/productos-admin/productos-admin.component';
import { ProductoFormComponent } from './pages/producto-form/producto-form.component';

export const adminRoutes: Routes = [
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'productos' },
      { path: 'productos', pathMatch: 'full', component: ProductosAdminComponent },
      { path: 'productos/nuevo', component: ProductoFormComponent },
      { path: 'productos/:id/editar', component: ProductoFormComponent },
      { path: 'categorias', component: CategoriasAdminComponent },
    ],
  },
];
