import { Router } from "express";
import { UsuarioController } from "../controller/usuario.controller.js";

const usersRoutes = Router();
const usuarioController = new UsuarioController();

usersRoutes.get("/", usuarioController.getUsuarios);
usersRoutes.post("/registro", usuarioController.register);
usersRoutes.post("/login", usuarioController.login);
usersRoutes.get("/perfil/:id", usuarioController.getPerfil);
usersRoutes.put("/perfil/:id", usuarioController.updatePerfil);

export default usersRoutes;
