import type { Request, Response } from "express";
import { DatabaseNotConfiguredError, getPrisma } from "../../prisma.config.js";

type AddToCartPayload = {
    userId?: unknown;
    productId?: unknown;
    cantidad?: unknown;
};

type RemoveFromCartPayload = {
    userId?: unknown;
    productId?: unknown;
};

export class CartController {
    public getCart = async (req: Request, res: Response) => {
        const { userId } = req.query;
        const userIdNum = typeof userId === "string" ? parseInt(userId, 10) : NaN;

        if (isNaN(userIdNum)) {
            return res.status(400).json({ message: "El ID de usuario es inválido." });
        }

        try {
            const cart = await getPrisma().cart.findUnique({
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

            if (!cart) {
                return res.status(404).json({ message: "No se encontró el carrito del usuario." });
            }

            return res.status(200).json({ cart });
        } catch (error: unknown) {
            if (error instanceof DatabaseNotConfiguredError) {
                return res.status(503).json({ message: "La base de datos no está configurada. Definí DATABASE_URL en back/.env." });
            }
            console.error("Error al obtener carrito:", error);
            return res.status(500).json({ message: "No se pudo obtener el carrito. Intentá nuevamente." });
        }
    };

    public addToCart = async (req: Request, res: Response) => {
        const payload = (req.body ?? {}) as AddToCartPayload;
        const userId = typeof payload.userId === "string" || typeof payload.userId === "number" ? Number(payload.userId) : NaN;
        const productId = typeof payload.productId === "string" || typeof payload.productId === "number" ? Number(payload.productId) : NaN;
        const cantidad = typeof payload.cantidad === "string" || typeof payload.cantidad === "number" ? Number(payload.cantidad) : 1;

        const fieldErrors: Record<string, string> = {};
        if (isNaN(userId)) fieldErrors.userId = "El ID de usuario es inválido.";
        if (isNaN(productId)) fieldErrors.productId = "El ID de producto es inválido.";
        if (isNaN(cantidad) || cantidad < 1) fieldErrors.cantidad = "La cantidad debe ser al menos 1.";

        if (Object.keys(fieldErrors).length > 0) {
            return res.status(400).json({ message: "Revisá los campos marcados.", fieldErrors });
        }

        try {
            const prisma = getPrisma();

            const producto = await prisma.producto.findUnique({
                where: { id: productId },
            });

            if (!producto) {
                return res.status(404).json({ message: "El producto no existe." });
            }

            if (!producto.activo) {
                return res.status(400).json({ message: "El producto no está disponible." });
            }

            if (producto.stock < cantidad) {
                return res.status(400).json({ message: "No hay suficiente stock disponible." });
            }

            let cart = await prisma.cart.findUnique({
                where: { userId },
            });

            if (!cart) {
                cart = await prisma.cart.create({
                    data: { userId },
                });
            }

            const existingItem = await prisma.cartItem.findUnique({
                where: {
                    cartId_productId: {
                        cartId: cart.id,
                        productId,
                    },
                },
            });

            if (existingItem) {
                const newCantidad = existingItem.cantidad + cantidad;
                if (producto.stock < newCantidad) {
                    return res.status(400).json({ message: "No hay suficiente stock disponible para la cantidad total." });
                }
                await prisma.cartItem.update({
                    where: { id: existingItem.id },
                    data: { cantidad: newCantidad },
                });
            } else {
                await prisma.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId,
                        cantidad,
                    },
                });
            }

            const updatedCart = await prisma.cart.findUnique({
                where: { id: cart.id },
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

            return res.status(200).json({ message: "Producto agregado al carrito.", cart: updatedCart });
        } catch (error: unknown) {
            if (error instanceof DatabaseNotConfiguredError) {
                return res.status(503).json({ message: "La base de datos no está configurada. Definí DATABASE_URL en back/.env." });
            }
            console.error("Error al agregar al carrito:", error);
            return res.status(500).json({ message: "No se pudo agregar el producto al carrito. Intentá nuevamente." });
        }
    };

    public removeFromCart = async (req: Request, res: Response) => {
        const payload = (req.body ?? {}) as RemoveFromCartPayload;
        const userId = typeof payload.userId === "string" || typeof payload.userId === "number" ? Number(payload.userId) : NaN;
        const productId = typeof payload.productId === "string" || typeof payload.productId === "number" ? Number(payload.productId) : NaN;

        const fieldErrors: Record<string, string> = {};
        if (isNaN(userId)) fieldErrors.userId = "El ID de usuario es inválido.";
        if (isNaN(productId)) fieldErrors.productId = "El ID de producto es inválido.";

        if (Object.keys(fieldErrors).length > 0) {
            return res.status(400).json({ message: "Revisá los campos marcados.", fieldErrors });
        }

        try {
            const prisma = getPrisma();

            const cart = await prisma.cart.findUnique({
                where: { userId },
            });

            if (!cart) {
                return res.status(404).json({ message: "No se encontró el carrito del usuario." });
            }

            const cartItem = await prisma.cartItem.findUnique({
                where: {
                    cartId_productId: {
                        cartId: cart.id,
                        productId,
                    },
                },
            });

            if (!cartItem) {
                return res.status(404).json({ message: "El producto no está en el carrito." });
            }

            await prisma.cartItem.delete({
                where: { id: cartItem.id },
            });

            const updatedCart = await prisma.cart.findUnique({
                where: { id: cart.id },
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

            return res.status(200).json({ message: "Producto eliminado del carrito.", cart: updatedCart });
        } catch (error: unknown) {
            if (error instanceof DatabaseNotConfiguredError) {
                return res.status(503).json({ message: "La base de datos no está configurada. Definí DATABASE_URL en back/.env." });
            }
            console.error("Error al eliminar del carrito:", error);
            return res.status(500).json({ message: "No se pudo eliminar el producto del carrito. Intentá nuevamente." });
        }
    };

    public updateQuantity = async (req: Request, res: Response) => {
        const payload = (req.body ?? {}) as AddToCartPayload;
        const userId = typeof payload.userId === "string" || typeof payload.userId === "number" ? Number(payload.userId) : NaN;
        const productId = typeof payload.productId === "string" || typeof payload.productId === "number" ? Number(payload.productId) : NaN;
        const cantidad = typeof payload.cantidad === "string" || typeof payload.cantidad === "number" ? Number(payload.cantidad) : NaN;

        const fieldErrors: Record<string, string> = {};
        if (isNaN(userId)) fieldErrors.userId = "El ID de usuario es inválido.";
        if (isNaN(productId)) fieldErrors.productId = "El ID de producto es inválido.";
        if (isNaN(cantidad) || cantidad < 1) fieldErrors.cantidad = "La cantidad debe ser al menos 1.";

        if (Object.keys(fieldErrors).length > 0) {
            return res.status(400).json({ message: "Revisá los campos marcados.", fieldErrors });
        }

        try {
            const prisma = getPrisma();

            const cart = await prisma.cart.findUnique({
                where: { userId },
            });

            if (!cart) {
                return res.status(404).json({ message: "No se encontró el carrito del usuario." });
            }

            const cartItem = await prisma.cartItem.findUnique({
                where: {
                    cartId_productId: {
                        cartId: cart.id,
                        productId,
                    },
                },
                include: {
                    producto: true,
                },
            });

            if (!cartItem) {
                return res.status(404).json({ message: "El producto no está en el carrito." });
            }

            if (cartItem.producto.stock < cantidad) {
                return res.status(400).json({ message: "No hay suficiente stock disponible." });
            }

            await prisma.cartItem.update({
                where: { id: cartItem.id },
                data: { cantidad },
            });

            const updatedCart = await prisma.cart.findUnique({
                where: { id: cart.id },
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

            return res.status(200).json({ message: "Cantidad actualizada.", cart: updatedCart });
        } catch (error: unknown) {
            if (error instanceof DatabaseNotConfiguredError) {
                return res.status(503).json({ message: "La base de datos no está configurada. Definí DATABASE_URL en back/.env." });
            }
            console.error("Error al actualizar cantidad:", error);
            return res.status(500).json({ message: "No se pudo actualizar la cantidad. Intentá nuevamente." });
        }
    };
}
