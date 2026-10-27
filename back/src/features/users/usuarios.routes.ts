import { Router } from "express";
import { UsuarioController } from "./usuario.controller.js";

const usersRoutes = Router();
const usuarioController = new UsuarioController();

usersRoutes.get("/", usuarioController.getUsuarios);
usersRoutes.post("/registro", usuarioController.register);
usersRoutes.post("/login", usuarioController.login);

export default usersRoutes;
