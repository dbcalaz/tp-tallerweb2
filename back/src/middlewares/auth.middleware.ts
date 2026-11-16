import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ForbiddenError, UnauthorizedError } from "../errors/http.error.js";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    const [scheme, token] = (req.headers.authorization ?? "").split(" ");
    if (scheme !== "Bearer" || !token) {
        throw new UnauthorizedError("Iniciá sesión para continuar.");
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!, { algorithms: ["HS256"] }) as jwt.JwtPayload;
        res.locals.auth = { userId: Number(payload.sub), rol: payload.rol };
    } catch {
        throw new UnauthorizedError("Tu sesión venció o no es válida. Iniciá sesión nuevamente.");
    }

    next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
    requireAuth(req, res, () => {
        if (res.locals.auth.rol !== "ADMIN") {
            throw new ForbiddenError("No tenés permisos para realizar esta acción.");
        }
        next();
    });
}

export function requireOwner(paramName: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
        requireAuth(req, res, () => {
            if (res.locals.auth.userId !== Number(req.params[paramName])) {
                throw new ForbiddenError("No podés acceder a los datos de otro usuario.");
            }
            next();
        });
    };
}