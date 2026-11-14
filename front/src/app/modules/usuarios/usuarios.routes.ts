import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { RegistroComponent } from './pages/registro/registro.component';

export const usuariosRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'usuarios/registro', component: RegistroComponent },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
];
