import { Router } from "express";
import { ProductoController } from '../controller/producto.controller.js';


const productoRouter = Router()

const productoController = new ProductoController();

productoRouter.get('/', productoController.getProductos)
productoRouter.get('/:id', productoController.getProductoPorId)

export default productoRouter