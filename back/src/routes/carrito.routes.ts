import { Router } from "express";

const carritoRoutes = Router();

carritoRoutes.get("/", (_req, res) => {
    res.status(501).json({ message: "El módulo del carrito todavía no está implementado." });
});

export default carritoRoutes;