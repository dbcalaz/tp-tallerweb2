import { prisma } from "../prisma.config.js";

export class CategoriaRepository {

    async getCategorias() {
        const categorias = await prisma.categoria.findMany({
            where: { activo: true },
            orderBy: { nombre: "asc" },
            include: {
                tiposProducto: {
                    where: { activo: true },
                    include: {
                        _count: {
                            select: { productos: { where: { activo: true, marca: { activo: true } } } },
                        },
                    },
                },
            },
        });

        return categorias;
    }

    async getTiposProducto() {
        return prisma.tipoProducto.findMany({ orderBy: { nombre: "asc" } });
    }
}