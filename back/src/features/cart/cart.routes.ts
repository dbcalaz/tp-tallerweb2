import { Router } from "express";
import { CartController } from "./cart.controller.js";

const cartRoutes = Router();
const cartController = new CartController();

cartRoutes.get("/", cartController.getCart);
cartRoutes.post("/agregar", cartController.addToCart);
cartRoutes.post("/eliminar", cartController.removeFromCart);
cartRoutes.post("/actualizar-cantidad", cartController.updateQuantity);

export default cartRoutes;