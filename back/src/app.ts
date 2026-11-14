import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { HttpError } from "./errors/http.error.js";
import { requestLogger } from "./middlewares/logger.middleware.js";
import { AppRoutes } from "./routes/routes.js";

export const app = express();

app.use(express.json());
app.use(cors());
app.use(requestLogger);
app.use(AppRoutes.routes);

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
        return res.status(err.statusCode).json({
            message: err.message,
            ...(err.fieldErrors ? { fieldErrors: err.fieldErrors } : {}),
        });
    }

    console.error(`[ERR] ${new Date().toLocaleTimeString("es-AR", { hour12: false })} ${req.method} ${req.url} -> Unhandled Error:`, err);
    return res.status(500).json({
        message: "Error interno del servidor.",
    });
});
