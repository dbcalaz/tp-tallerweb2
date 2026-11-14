import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { RecuperarContrasenaComponent } from './pages/recuperar-contrasena/recuperar-contrasena.component';
import { RestablecerContrasenaComponent } from './pages/restablecer-contrasena/restablecer-contrasena.component';

export const usuariosRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'usuarios/registro', component: RegistroComponent },
  { path: 'recuperar-contrasena', component: RecuperarContrasenaComponent },
  { path: 'restablecer-contrasena', component: RestablecerContrasenaComponent },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
];
