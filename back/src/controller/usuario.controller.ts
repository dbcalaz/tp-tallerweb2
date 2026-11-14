import type { Request, Response } from "express";
import { IdParamDto } from "../dto/params.dto.js";
import {
    ActualizarPerfilDto,
    LoginUsuarioDto,
    RegistroUsuarioDto,
} from "../dto/usuario.dto.js";
import { UsuarioRepository } from "../repository/usuario.repository.js";
import { UsuarioService } from "../services/usuario.service.js";

const usuarioRepository = new UsuarioRepository();
const usuarioService = new UsuarioService(usuarioRepository);

export class UsuarioController {
    public getUsuarios = async (_req: Request, res: Response) => {
        res.status(200).json({ message: "API de usuarios disponible." });
    };

    public register = async (req: Request, res: Response) => {
        const dto = RegistroUsuarioDto.fromBody(req.body);
        const user = await usuarioService.registrar(dto);
        return res.status(201).json({
            message: "Tu cuenta se creó correctamente.",
            user,
        });
    };

    public login = async (req: Request, res: Response) => {
        const dto = LoginUsuarioDto.fromBody(req.body);
        const user = await usuarioService.login(dto);
        return res.status(200).json({
            message: "Sesión iniciada correctamente.",
            user,
        });
    };

    public getPerfil = async (req: Request, res: Response) => {
        const userId = IdParamDto.parse(req.params.id, "ID de usuario");
        const perfil = await usuarioService.obtenerPerfil(userId);
        return res.status(200).json(perfil);
    };

    public updatePerfil = async (req: Request, res: Response) => {
        const userId = IdParamDto.parse(req.params.id, "ID de usuario");
        const dto = ActualizarPerfilDto.fromBody(req.body);
        const user = await usuarioService.actualizarPerfil(userId, dto);
        return res.status(200).json({
            message: "Perfil actualizado correctamente.",
            user,
        });
    };
}
