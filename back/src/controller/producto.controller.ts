import type { Request, Response } from "express";
import { IdParamDto } from "../dto/params.dto.js";
import { FiltroProductoDto } from "../dto/producto.dto.js";
import { ProductoRepository } from "../repository/producto.repository.js";
import { ProductoService } from "../services/producto.service.js";

const productoRepository = new ProductoRepository();
const productoService = new ProductoService(productoRepository);

export class ProductoController {
    public getProductos = async (req: Request, res: Response) => {
        const filtro = FiltroProductoDto.fromQuery(req.query as Record<string, unknown>);
        const productos = await productoService.obtenerProductos(filtro);
        return res.status(200).json(productos);
    };

    public getProductoPorId = async (req: Request, res: Response) => {
        const id = IdParamDto.parse(req.params.id, "ID de producto");
        const producto = await productoService.obtenerProductoPorId(id);
        return res.status(200).json(producto);
    };
}
