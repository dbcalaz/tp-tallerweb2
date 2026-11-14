import { prisma } from "../prisma.config.js";

const CARRITO_INCLUDE = {
    items: {
        include: {
            producto: {
                include: {
                    marca: true,
                    tipoProducto: true,
                },
            },
        },
        orderBy: { createdAt: "asc" as const },
    },
};

export class CarritoRepository {
    async findOrCreateByUserId(userId: number) {
        let carrito = await prisma.carrito.findUnique({
            where: { userId },
            include: CARRITO_INCLUDE,
        });

        if (!carrito) {
            carrito = await prisma.carrito.create({
                data: { userId },
                include: CARRITO_INCLUDE,
            });
        }

        return carrito;
    }

    async findProductoActivo(productoId: number) {
        return prisma.producto.findFirst({
            where: { id: productoId, activo: true },
        });
    }

    async findUserById(userId: number) {
        return prisma.user.findUnique({ where: { id: userId } });
    }

    async upsertItem(carritoId: number, productoId: number, cantidad: number) {
        const existingItem = await prisma.carritoProducto.findUnique({
            where: {
                carritoId_productoId: { carritoId, productoId },
            },
        });

        if (existingItem) {
            return prisma.carritoProducto.update({
                where: { id: existingItem.id },
                data: { cantidad: existingItem.cantidad + cantidad },
            });
        }

        return prisma.carritoProducto.create({
            data: { carritoId, productoId, cantidad },
        });
    }

    async updateItemQuantity(carritoId: number, productoId: number, cantidad: number) {
        if (cantidad <= 0) {
            return prisma.carritoProducto.deleteMany({
                where: { carritoId, productoId },
            });
        }

        return prisma.carritoProducto.updateMany({
            where: { carritoId, productoId },
            data: { cantidad },
        });
    }

    async removeItem(carritoId: number, productoId: number) {
        return prisma.carritoProducto.deleteMany({
            where: { carritoId, productoId },
        });
    }

    async clearItems(carritoId: number) {
        return prisma.carritoProducto.deleteMany({
            where: { carritoId },
        });
    }

    async executeCheckoutTransaction(params: {
        userId: number;
        carritoId: number;
        total: number;
        direccionEnvio: string;
        items: Array<{ productoId: number; cantidad: number; precioUnitario: unknown }>;
    }) {
        return prisma.$transaction(async (tx) => {
            const nuevaCompra = await tx.compra.create({
                data: {
                    userId: params.userId,
                    total: params.total,
                    estado: "COMPLETADA",
                    direccionEnvio: params.direccionEnvio,
                    detalles: {
                        create: params.items.map((item) => ({
                            productoId: item.productoId,
                            cantidad: item.cantidad,
                            precioUnitario: Number(item.precioUnitario),
                        })),
                    },
                },
                include: {
                    detalles: {
                        include: {
                            producto: true,
                        },
                    },
                },
            });

            await tx.carritoProducto.deleteMany({
                where: { carritoId: params.carritoId },
            });

            return nuevaCompra;
        });
    }
}

