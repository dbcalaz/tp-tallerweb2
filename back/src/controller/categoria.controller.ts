import type { Request, Response } from "express";
import { CategoriaRepository } from "../repository/categoria.repository.js";
import { CategoriaService } from "../services/categoria.service.js";

const categoriaRepository = new CategoriaRepository();
const categoriaService = new CategoriaService(categoriaRepository);

export class CategoriaController {
    public getCategorias = async (_req: Request, res: Response) => {
        const categorias = await categoriaService.obtenerCategorias();
        return res.status(200).json(categorias);
    };
}
