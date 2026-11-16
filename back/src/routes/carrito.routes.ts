import { Router } from "express";
import { CarritoController } from "../controller/carrito.controller.js";
import { requireOwner } from "../middlewares/auth.middleware.js";

const carritoRoutes = Router();
const carritoController = new CarritoController();

carritoRoutes.use("/:userId", requireOwner("userId"));
carritoRoutes.get("/:userId", carritoController.getCarrito);
carritoRoutes.post("/:userId/items", carritoController.agregarItem);
carritoRoutes.patch("/:userId/items/:productoId", carritoController.actualizarCantidad);
carritoRoutes.delete("/:userId/items/:productoId", carritoController.removerItem);
carritoRoutes.delete("/:userId", carritoController.vaciarCarrito);
carritoRoutes.post("/:userId/checkout", carritoController.checkout);

export default carritoRoutes;
