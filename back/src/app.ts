import express, { type Request, type Response, type NextFunction } from "express";
import { AppRoutes } from "./routes/routes.js";
import { requestLogger } from "./middlewares/logger.middleware.js";

export const app = express();

app.use(express.json());
app.use(requestLogger);
app.use(AppRoutes.routes);

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    console.error(`[ERR] ${new Date().toLocaleTimeString("es-AR", { hour12: false })} ${req.method} ${req.url} -> Unhandled Error:`, err);
    res.status(500).json({ message: "Error interno del servidor.", error: err.message });
});