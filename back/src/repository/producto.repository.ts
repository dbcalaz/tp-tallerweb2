import { prisma } from "../prisma.config.js";
import type { FiltroProductoAdminDto } from "../dto/producto.dto.js";

export class ProductoRepository {

    async getProductos(busqueda?: string) {
        const palabras = (busqueda ?? "").trim().split(/\s+/).filter(Boolean);

        const productos = await prisma.producto.findMany({
            where: {
                activo: true,
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
            where: { id, activo: true },
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

    async getProductosAdmin(filtro: FiltroProductoAdminDto) {
        const where = {
            ...(filtro.busqueda ? { nombre: { contains: filtro.busqueda, mode: "insensitive" as const } } : {}),
            ...(filtro.tipoProductoId ? { tipoProductoId: filtro.tipoProductoId } : {}),
            ...(filtro.categoriaId ? { tipoProducto: { categoriaId: filtro.categoriaId } } : {}),
            ...(filtro.activo !== undefined ? { activo: filtro.activo } : {}),
        };

        const [items, total] = await Promise.all([
            prisma.producto.findMany({
                where,
                include: { marca: true, tipoProducto: { include: { categoria: true } } },
                orderBy: { id: "asc" },
                skip: (filtro.pagina - 1) * filtro.limite,
                take: filtro.limite,
            }),
            prisma.producto.count({ where }),
        ]);

        return { items, total };
    }

    async actualizarActivo(id: number, activo: boolean) {
        return prisma.producto.update({
            where: { id },
            data: { activo },
            include: { marca: true, tipoProducto: { include: { categoria: true } } },
        });
    }
}