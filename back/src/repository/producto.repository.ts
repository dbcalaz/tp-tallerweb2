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
}