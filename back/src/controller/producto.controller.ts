import { type Request, type Response } from "express";
import { ProductoRepository } from "../repository/producto.repository.js";
import { ProductoService } from "../services/producto.service.js";

const productoRepository = new ProductoRepository();
const productoService = new ProductoService(productoRepository);

export class ProductoController {

    public getProductos = async (req: Request, res: Response) => {
        try {

            const productos = await productoService.obtenerProductos();
            console.log(productos)
            return res.json(productos);
        } catch (error: any) {
            if (error.message) {
                return res.status(500).json({ mensaje: error.message });

            }
            return res.status(500).json({ mensaje: "Error interno del servidor" });
        }
    }

    public getProductoPorId = async (req: Request, res: Response) => {
        try {

            const id = Number(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({ mensaje: "El ID proporcionado no es válido." });
            }
            const producto = await productoService.obtenerProductoPorId(id);
            return res.json(producto);
        } catch (error: any) {
            if (error.message) {
                return res.status(500).json({ mensaje: error.message });

            }
            return res.status(500).json({ mensaje: "Error interno del servidor" });
        }
    }
}