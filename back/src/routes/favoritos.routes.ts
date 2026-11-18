import { Router } from "express";
import { FavoritosController } from "../controller/favoritos.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const routes = Router();
const controller = new FavoritosController();
routes.use(requireAuth);
routes.get("/", controller.listar);
routes.post("/:productoId", controller.agregar);
routes.delete("/:productoId", controller.quitar);

export default routes;
