import type { Request, Response } from "express";
import { prisma } from "../prisma.config.js";
import { IdParamDto } from "../dto/params.dto.js";

export class FavoritosController {
    public listar = async (_req: Request, res: Response) => {
        const userId = res.locals.auth.userId as number;
        const favoritos = await prisma.favorito.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: { producto: { include: { marca: true, tipoProducto: { include: { categoria: true } } } } },
        });
        return res.json(favoritos.map(({ producto }) => producto));
    };

    public agregar = async (req: Request, res: Response) => {
        const productoId = IdParamDto.parse(req.params.productoId, "ID de producto");
        const userId = res.locals.auth.userId as number;
        try {
            await prisma.favorito.create({ data: { userId, productoId } });
        } catch (error: unknown) {
            if (!(error && typeof error === "object" && "code" in error && error.code === "P2002")) throw error;
        }
        return res.status(200).json({ favorito: true });
    };

    public quitar = async (req: Request, res: Response) => {
        const productoId = IdParamDto.parse(req.params.productoId, "ID de producto");
        const userId = res.locals.auth.userId as number;
        await prisma.favorito.deleteMany({ where: { userId, productoId } });
        return res.json({ favorito: false });
    };
}
