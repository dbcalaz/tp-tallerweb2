import { Router } from "express";
import { CartController } from "./cart.controller.js";

const carritoRoutes = Router();
const cartController = new CartController();

carritoRoutes.get("/", cartController.getCart);
carritoRoutes.post("/agregar", cartController.addToCart);
carritoRoutes.post("/eliminar", cartController.removeFromCart);
carritoRoutes.post("/actualizar-cantidad", cartController.updateQuantity);

export default carritoRoutes;