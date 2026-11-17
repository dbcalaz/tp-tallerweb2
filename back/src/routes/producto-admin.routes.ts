import { Router } from "express";
import { ProductoController } from "../controller/producto.controller.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";

const productoAdminRouter = Router();
const productoController = new ProductoController();

// Todo lo de este router es solo para el administrador.
productoAdminRouter.use(requireAdmin);
productoAdminRouter.get("/", productoController.getProductosAdmin);
productoAdminRouter.post("/", productoController.crearProductoAdmin);
productoAdminRouter.get("/:id", productoController.getProductoAdminPorId);
productoAdminRouter.patch("/:id", productoController.editarProductoAdmin);
productoAdminRouter.patch("/:id/activo", productoController.actualizarActivo);

export default productoAdminRouter;
