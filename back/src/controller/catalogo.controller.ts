import type { Request, Response } from "express";
import { CatalogoRepository } from "../repository/catalogo.repository.js";
import { CatalogoService } from "../services/catalogo.service.js";

const catalogoRepository = new CatalogoRepository();
const catalogoService = new CatalogoService(catalogoRepository);

export class CatalogoController {
    public getCatalogoAdmin = async (_req: Request, res: Response) => {
        const catalogo = await catalogoService.obtenerCatalogoAdmin();
        return res.status(200).json(catalogo);
    };
}