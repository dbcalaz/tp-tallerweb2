import type { Request, Response } from "express";

export class UsuarioController {
    public getUsuarios = async (req: Request, res: Response) => {
        res.status(200).json("Todo ok");
    }
}