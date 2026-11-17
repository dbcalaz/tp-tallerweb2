import { Router } from "express";
import { CatalogoController } from "../controller/catalogo.controller.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";

const catalogoAdminRouter = Router();
const catalogoController = new CatalogoController();

// Todo lo de este router es solo para el administrador.
catalogoAdminRouter.use(requireAdmin);
catalogoAdminRouter.get("/opciones", catalogoController.getOpcionesProducto);
catalogoAdminRouter.get("/", catalogoController.getCatalogoAdmin);
catalogoAdminRouter.post("/categorias", catalogoController.crearCategoria);
catalogoAdminRouter.patch("/categorias/:id", catalogoController.editarCategoria);
catalogoAdminRouter.patch("/categorias/:id/estado", catalogoController.estadoCategoria);
catalogoAdminRouter.post("/categorias/:id/tipos", catalogoController.crearTipo);
catalogoAdminRouter.post("/tipos", catalogoController.crearTipo);
catalogoAdminRouter.patch("/tipos/:id", catalogoController.editarTipo);
catalogoAdminRouter.patch("/tipos/:id/estado", catalogoController.estadoTipo);
catalogoAdminRouter.post("/marcas", catalogoController.crearMarca);
catalogoAdminRouter.patch("/marcas/:id", catalogoController.editarMarca);
catalogoAdminRouter.patch("/marcas/:id/estado", catalogoController.estadoMarca);

export default catalogoAdminRouter;
