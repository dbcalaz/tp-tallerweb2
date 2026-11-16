import { Router } from "express";
import { UsuarioController } from "../controller/usuario.controller.js";
import { requireOwner } from "../middlewares/auth.middleware.js";

const usersRoutes = Router();
const usuarioController = new UsuarioController();

usersRoutes.get("/", usuarioController.getUsuarios);
usersRoutes.post("/registro", usuarioController.register);
usersRoutes.post("/login", usuarioController.login);
usersRoutes.post("/recuperar-password", usuarioController.solicitarRecuperacion);
usersRoutes.post("/restablecer-password", usuarioController.restablecerPassword);
usersRoutes.get("/perfil/:id", requireOwner("id"), usuarioController.getPerfil);
usersRoutes.put("/perfil/:id", requireOwner("id"), usuarioController.updatePerfil);

export default usersRoutes;
