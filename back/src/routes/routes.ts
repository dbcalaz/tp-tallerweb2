import { Router } from "express";
import carritoRoutes from "./carrito.routes.js";
import categoriaRoutes from "./categoria.routes.js";
import productoRoutes from "./producto.routes.js";
import usersRoutes from "./usuarios.routes.js";

export class AppRoutes {
    static get routes(): Router {
        const router = Router();
        router.use("/api/usuario", usersRoutes);
        router.use("/api/productos", productoRoutes);
        router.use("/api/carrito", carritoRoutes);
        router.use("/api/categorias", categoriaRoutes);

        return router;
    }
}
