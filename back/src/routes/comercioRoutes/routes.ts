import { Router } from 'express';
import usuarioRouter from '../usuariosRoutes/usuarios.routes.js';
// Este es el route genérico

export class AppRoutes {

    static get routes(): Router {
        const router = Router();
        router.use("/api/usuario", usuarioRouter)

        return router
    }
}