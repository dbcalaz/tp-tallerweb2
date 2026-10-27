import { Router } from "express";

const productsRoutes = Router();

productsRoutes.get("/", (_req, res) => {
    res.status(501).json({ message: "El módulo de productos todavía no está implementado." });
});

export default productsRoutes;