import { Router } from "express";
import { UsuarioController } from "../../controller/usuario.controller.js";

const usuarioRouter = Router();
const usuarioController = new UsuarioController();

usuarioRouter.get("/", usuarioController.getUsuarios);

export default usuarioRouter;