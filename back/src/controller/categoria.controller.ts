import { type Request, type Response } from "express";
import { CategoriaRepository } from "../repository/categoria.repository.js";
import { CategoriaService } from "../services/categoria.service.js";

const categoriaRepository = new CategoriaRepository();
const categoriaService = new CategoriaService(categoriaRepository);

export class CategoriaController {

    public getCategorias = async (req: Request, res: Response) => {
        try {
            const categorias = await categoriaService.obtenerCategorias();
            return res.json(categorias);
        } catch (error: any) {
            if (error.message) {
                return res.status(500).json({ mensaje: error.message });
            }
            return res.status(500).json({ mensaje: "Error interno del servidor" });
        }
    }
}