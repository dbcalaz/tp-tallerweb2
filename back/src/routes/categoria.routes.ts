import { Router } from "express";
import { CategoriaController } from "../controller/categoria.controller.js";

const categoriaRouter = Router();
const categoriaController = new CategoriaController();

categoriaRouter.get("/", categoriaController.getCategorias);
categoriaRouter.get("/tipos", categoriaController.getTiposProducto);

export default categoriaRouter;

