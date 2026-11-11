import { prisma } from "../prisma.config.js";

export class CategoriaRepository {

    async getCategorias() {
        const categorias = await prisma.categoria.findMany({
            orderBy: { nombre: "asc" },
            include: {
                tiposProducto: {
                    include: {
                        _count: { select: { productos: true } }
                    }
                }
            }
        });

        return categorias;
    }
}