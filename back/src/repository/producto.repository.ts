import { prisma } from "../prisma.config.js";

export class ProductoRepository {

    async getProductos(busqueda?: string) {
        const palabras = (busqueda ?? "").trim().split(/\s+/).filter(Boolean);

        const productos = await prisma.producto.findMany({
            where: {
                AND: palabras.map((palabra) => {
                    const coincide = { contains: palabra, mode: "insensitive" as const };
                    return {
                        OR: [
                            { nombre: coincide },
                            { marca: { nombre: coincide } },
                            { tipoProducto: { nombre: coincide } },
                            { tipoProducto: { categoria: { nombre: coincide } } },
                        ]
                    };
                })
            },
            include: {
                marca: true,
                tipoProducto: {
                    include: {
                        categoria: true
                    }
                }
            }
        });

        return productos;
    }

    async getProductoPorId(id: number) {
        const producto = await prisma.producto.findUnique({
            where: { id },
            include: {
                marca: true,
                tipoProducto: {
                    include: {
                        categoria: true
                    }
                }
            }
        });

        return producto;
    }
}