import { Router } from "express";
import productoRoutes from "./producto.routes.js";
import usersRoutes from "./usuarios.routes.js";
import carritoRoutes from "./carrito.routes.js";

export class AppRoutes{

    static get routes():Router{
        const router = Router();
        router.use("/api/usuario", usersRoutes);
        router.use("/api/productos", productoRoutes);
        router.use("/api/carrito", carritoRoutes);

        return router
    }
}