import { Router } from "express";
import carritoRoutes from "./carrito.routes.js";
import categoriaRoutes from "./categoria.routes.js";
import productoRoutes from "./producto.routes.js";
import usersRoutes from "./usuarios.routes.js";
import productoAdminRoutes from "./producto-admin.routes.js";
import catalogoAdminRoutes from "./catalogo.routes.js";
import favoritosRoutes from "./favoritos.routes.js";

export class AppRoutes {
    static get routes(): Router {
        const router = Router();
        router.get("/api/health", (_req, res) => {
            res.status(200).json({ status: "ok" });
        });
        router.use("/api/usuario", usersRoutes);
        router.use("/api/productos", productoRoutes);
        router.use("/api/favoritos", favoritosRoutes);
        router.use("/api/carrito", carritoRoutes);
        router.use("/api/categorias", categoriaRoutes);
        router.use("/api/admin/productos", productoAdminRoutes);
        router.use("/api/admin/catalogo", catalogoAdminRoutes);
        
        return router;
    }
}
