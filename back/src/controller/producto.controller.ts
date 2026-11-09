import { type Request, type Response } from "express";
import { prisma } from "../prisma.config.js";

export class ProductoController {

    public getProductos = async (req: Request, res: Response) => {
        try {
            const productos = await prisma.producto.findMany({
                include: {
                    marca: true,
                    tipoProducto: {
                        include: {
                            categoria: true
                        }
                    }
                }
            });

            return res.json(productos);
        } catch (error) {
            console.error("Error al obtener productos:", error);
            return res.status(500).json({ mensaje: "Error interno del servidor" });
        }
    }
}