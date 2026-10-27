import { Router } from "express";

const cartRoutes = Router();

cartRoutes.get("/", (_req, res) => {
    res.status(501).json({ message: "El módulo del carrito todavía no está implementado." });
});

export default cartRoutes;