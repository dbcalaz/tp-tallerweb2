import { Router } from "express";
import { CarritoController } from "../controller/carrito.controller.js";

const carritoRoutes = Router();
const carritoController = new CarritoController();

carritoRoutes.get("/", carritoController.getCarrito);
carritoRoutes.post("/agregar", carritoController.addToCart);
carritoRoutes.post("/eliminar", carritoController.removeFromCart);
carritoRoutes.post("/actualizar-cantidad", carritoController.updateQuantity);
carritoRoutes.post("/vaciar", carritoController.clearCart);

export default carritoRoutes;