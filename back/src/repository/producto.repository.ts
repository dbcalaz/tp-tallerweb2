import { prisma } from "../prisma.config.js";

export class ProductoRepository {

    async getProductos() {
        const productos = await prisma.producto.findMany({
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