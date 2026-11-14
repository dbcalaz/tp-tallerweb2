import type { Request, Response } from "express";
import {
    ActualizarCantidadDto,
    AgregarItemCarritoDto,
    CheckoutDto,
} from "../dto/carrito.dto.js";
import { IdParamDto } from "../dto/params.dto.js";
import { CarritoRepository } from "../repository/carrito.repository.js";
import { CarritoService } from "../services/carrito.service.js";

const carritoRepository = new CarritoRepository();
const carritoService = new CarritoService(carritoRepository);

export class CarritoController {
    public getCarrito = async (req: Request, res: Response) => {
        const userId = IdParamDto.parse(req.params.userId, "ID de usuario");
        const carrito = await carritoService.obtenerCarrito(userId);
        return res.status(200).json(carrito);
    };

    public agregarItem = async (req: Request, res: Response) => {
        const userId = IdParamDto.parse(req.params.userId, "ID de usuario");
        const dto = AgregarItemCarritoDto.fromBody(req.body);
        const carrito = await carritoService.agregarItem(userId, dto);
        return res.status(200).json(carrito);
    };

    public actualizarCantidad = async (req: Request, res: Response) => {
        const userId = IdParamDto.parse(req.params.userId, "ID de usuario");
        const productoId = IdParamDto.parse(req.params.productoId, "ID de producto");
        const dto = ActualizarCantidadDto.fromBody(req.body);
        const carrito = await carritoService.actualizarCantidad(userId, productoId, dto);
        return res.status(200).json(carrito);
    };

    public removerItem = async (req: Request, res: Response) => {
        const userId = IdParamDto.parse(req.params.userId, "ID de usuario");
        const productoId = IdParamDto.parse(req.params.productoId, "ID de producto");
        const carrito = await carritoService.removerItem(userId, productoId);
        return res.status(200).json(carrito);
    };

    public vaciarCarrito = async (req: Request, res: Response) => {
        const userId = IdParamDto.parse(req.params.userId, "ID de usuario");
        const carrito = await carritoService.vaciarCarrito(userId);
        return res.status(200).json(carrito);
    };

    public checkout = async (req: Request, res: Response) => {
        const userId = IdParamDto.parse(req.params.userId, "ID de usuario");
        const dto = CheckoutDto.fromBody(req.body);
        const resultado = await carritoService.checkout(userId, dto);
        return res.status(201).json(resultado);
    };
}
