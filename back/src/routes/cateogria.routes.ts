import { Router } from "express";
import { CategoriaController } from "../controller/categoria.controller.js";

const categoriaRouter = Router();

const categoriaController = new CategoriaController();

categoriaRouter.get("/", categoriaController.getCategorias);

export default categoriaRouter;