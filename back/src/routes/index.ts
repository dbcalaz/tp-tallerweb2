import { Router } from "express";
import cartRoutes from "../features/cart/cart.routes.js";
import productsRoutes from "../features/products/products.routes.js";
import usersRoutes from "../features/users/usuarios.routes.js";

export class AppRoutes {
    static get routes(): Router {
        const router = Router();
        router.use("/api/usuario", usersRoutes);
        router.use("/api/productos", productsRoutes);
        router.use("/api/carrito", cartRoutes);
        return router;
    }
}