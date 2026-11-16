import { Router } from "express";
import { CatalogoController } from "../controller/catalogo.controller.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";

const catalogoAdminRouter = Router();
const catalogoController = new CatalogoController();

// Todo lo de este router es solo para el administrador.
catalogoAdminRouter.use(requireAdmin);
catalogoAdminRouter.get("/", catalogoController.getCatalogoAdmin);

export default catalogoAdminRouter;