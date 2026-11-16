import { prisma } from "../prisma.config.js";

export class CatalogoRepository {
    // Incluye también las categorías y tipos deshabilitados: es la vista del administrador.
    async getCategorias() {
        return prisma.categoria.findMany({
            orderBy: { nombre: "asc" },
            include: {
                tiposProducto: {
                    orderBy: { nombre: "asc" },
                    include: { _count: { select: { productos: true } } },
                },
            },
        });
    }

    async getMarcas() {
        return prisma.marca.findMany({
            orderBy: { nombre: "asc" },
            include: { _count: { select: { productos: true } } },
        });
    }
}