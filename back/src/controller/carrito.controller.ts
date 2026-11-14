import type { Request, Response } from "express";
import { prisma } from "../prisma.config.js";

type AddToCartPayload = {
    userId?: unknown;
    productoId?: unknown;
    cantidad?: unknown;
};

type RemoveFromCartPayload = {
    userId?: unknown;
    productoId?: unknown;
};

export class CarritoController {
    public getCarrito = async (req: Request, res: Response) => {
        const { userId } = req.query;
        const userIdNum = typeof userId === "string" ? parseInt(userId, 10) : NaN;

        if (isNaN(userIdNum)) {
            return res.status(400).json({ message: "El ID de usuario es inválido." });
        }

        try {
            const carrito = await prisma.carrito.findUnique({
                where: { userId: userIdNum },
                include: {
                    items: {
                        include: {
                            producto: {
                                include: {
                                    tipoProducto: {
                                        include: {
                                            categoria: true,
                                        },
                                    },
                                    marca: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!carrito) {
                return res.status(200).json({ carrito: { userId: userIdNum, items: [] } });
            }

            return res.status(200).json({ carrito });
        } catch (error: unknown) {
            console.error("Error al obtener carrito:", error);
            return res.status(500).json({ message: "No se pudo obtener el carrito. Intentá nuevamente." });
        }
    };

    public addToCart = async (req: Request, res: Response) => {
        const { userId, cantidad } = req.body;
        const productoId = Number(req.body.productoId ?? req.body.productId);
        const userIdNum = Number(userId);
        const cantidadNum = Number(cantidad) || 1;

        if (!userIdNum || !productoId || cantidadNum < 1) {
            return res.status(400).json({ message: 'Datos inválidos para agregar al carrito.' });
        }

        try {
            const producto = await prisma.producto.findUnique({
                where: { id: productoId },
            });

            if (!producto) {
                return res.status(404).json({ message: "El producto no existe." });
            }

            if (!producto.activo) {
                return res.status(400).json({ message: "El producto no está disponible." });
            }

            if (producto.stock < cantidadNum) {
                return res.status(400).json({ message: "No hay suficiente stock disponible." });
            }

            let carrito = await prisma.carrito.findUnique({
                where: { userId: userIdNum },
            });

            if (!carrito) {
                carrito = await prisma.carrito.create({
                    data: { userId: userIdNum },
                });
            }

            const existingItem = await prisma.carritoProducto.findUnique({
                where: {
                    carritoId_productoId: {
                        carritoId: carrito.id,
                        productoId,
                    },
                },
            });

            if (existingItem) {
                const newCantidad = existingItem.cantidad + cantidadNum;
                if (producto.stock < newCantidad) {
                    return res.status(400).json({ message: "No hay suficiente stock disponible para la cantidad total." });
                }
                await prisma.carritoProducto.update({
                    where: { id: existingItem.id },
                    data: { cantidad: { increment: cantidadNum } },
                });
            } else {
                await prisma.carritoProducto.create({
                    data: {
                        carritoId: carrito.id,
                        productoId,
                        cantidad,
                    },
                });
            }

            const updatedCarrito = await prisma.carrito.findUnique({
                where: { id: carrito.id },
                include: {
                    items: {
                        include: {
                            producto: {
                                include: {
                                    tipoProducto: {
                                        include: {
                                            categoria: true,
                                        },
                                    },
                                    marca: true,
                                },
                            },
                        },
                    },
                },
            });

            return res.status(200).json({ message: "Producto agregado al carrito.", carrito: updatedCarrito });
        } catch (error: unknown) {
            console.error("Error al agregar al carrito:", error);
            return res.status(500).json({ message: "No se pudo agregar el producto al carrito. Intentá nuevamente." });
        }
    };

    removeFromCart = async (req: Request, res: Response) => {
        try {
            const userId = Number(req.body.userId);
            const productoId = Number(req.body.productoId ?? req.body.productId);

            if (!userId || !productoId) {
                return res.status(400).json({ message: 'Datos inválidos para eliminar el producto.' });
            }

            const carrito = await prisma.carrito.findUnique({
                where: { userId },
            });

            if (!carrito) {
                return res.status(404).json({ message: 'Carrito no encontrado.' });
            }

            await prisma.carritoProducto.delete({
                where: {
                    carritoId_productoId: {
                        carritoId: carrito.id,
                        productoId,
                    },
                },
            });

            const carritoActualizado = await prisma.carrito.findUnique({
                where: { id: carrito.id },
                include: {
                    items: {
                        orderBy: { id: 'asc' },
                        include: {
                            producto: {
                                include: {
                                    marca: true,
                                    tipoProducto: { include: { categoria: true } },
                                },
                            },
                        },
                    },
                },
            });

            return res.status(200).json({
                message: 'Producto eliminado del carrito.',
                carrito: carritoActualizado,
            });
        } catch (error) {
            console.error('Error en removeFromCart:', error);
            return res.status(500).json({ message: 'Error interno al eliminar producto.' });
        }
    };

    updateQuantity = async (req: Request, res: Response) => {
        try {
            const userId = Number(req.body.userId);
            const productoId = Number(req.body.productoId ?? req.body.productId);
            const cantidad = Number(req.body.cantidad);

            if (!userId || !productoId || cantidad < 1) {
                return res.status(400).json({ message: 'Datos inválidos para actualizar cantidad.' });
            }

            const carrito = await prisma.carrito.findUnique({
                where: { userId },
            });

            if (!carrito) {
                return res.status(404).json({ message: 'Carrito no encontrado.' });
            }

            await prisma.carritoProducto.update({
                where: {
                    carritoId_productoId: {
                        carritoId: carrito.id,
                        productoId,
                    },
                },
                data: { cantidad },
            });

            const carritoActualizado = await prisma.carrito.findUnique({
                where: { id: carrito.id },
                include: {
                    items: {
                        orderBy: { id: 'asc' },
                        include: {
                            producto: {
                                include: {
                                    marca: true,
                                    tipoProducto: { include: { categoria: true } },
                                },
                            },
                        },
                    },
                },
            });

            return res.status(200).json({
                message: 'Cantidad actualizada.',
                carrito: carritoActualizado,
            });
        } catch (error) {
            console.error('Error en updateQuantity:', error);
            return res.status(500).json({ message: 'Error interno al actualizar la cantidad.' });
        }
    };

    public clearCart = async (req: Request, res: Response) => {
        const { userId } = req.body;
        const userIdNum = typeof userId === "string" || typeof userId === "number" ? Number(userId) : NaN;

        if (isNaN(userIdNum)) {
            return res.status(400).json({ message: "El ID de usuario es inválido." });
        }

        try {
            const carrito = await prisma.carrito.findUnique({
                where: { userId: userIdNum },
            });

            if (!carrito) {
                return res.status(404).json({ message: "No se encontró el carrito del usuario." });
            }

            await prisma.carritoProducto.deleteMany({
                where: { carritoId: carrito.id },
            });

            const updatedCarrito = await prisma.carrito.findUnique({
                where: { id: carrito.id },
                include: {
                    items: {
                        include: {
                            producto: {
                                include: {
                                    tipoProducto: {
                                        include: {
                                            categoria: true,
                                        },
                                    },
                                    marca: true,
                                },
                            },
                        },
                    },
                },
            });

            return res.status(200).json({ message: "Carrito vaciado.", carrito: updatedCarrito });
        } catch (error: unknown) {
            console.error("Error al vaciar carrito:", error);
            return res.status(500).json({ message: "No se pudo vaciar el carrito. Intentá nuevamente." });
        }
    };
}
