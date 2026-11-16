import type { Request, Response } from "express";
import { IdParamDto } from "../dto/params.dto.js";
import { ProductoRepository } from "../repository/producto.repository.js";
import { ProductoService } from "../services/producto.service.js";
import { FiltroProductoAdminDto, FiltroProductoDto, ActualizarActivoDto } from "../dto/producto.dto.js";

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

    public getProductosAdmin = async (req: Request, res: Response) => {
        const filtro = FiltroProductoAdminDto.fromQuery(req.query as Record<string, unknown>);
        const pagina = await productoService.obtenerProductosAdmin(filtro);
        return res.status(200).json(pagina);
    };

    public actualizarActivo = async (req: Request, res: Response) => {
        const id = IdParamDto.parse(req.params.id, "ID de producto");
        const dto = ActualizarActivoDto.fromBody(req.body);
        const producto = await productoService.cambiarActivo(id, dto);
        return res.status(200).json(producto);
    };
}
