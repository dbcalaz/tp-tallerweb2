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
}