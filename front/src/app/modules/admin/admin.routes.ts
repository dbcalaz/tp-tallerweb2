import { Routes } from '@angular/router';
import { ProductosAdminComponent } from './pages/productos-admin/productos-admin.component';
import { adminGuard } from '../../core/guards/admin.guard';

export const adminRoutes: Routes = [
  { path: 'admin/productos', component: ProductosAdminComponent, canActivate: [adminGuard] },
];
