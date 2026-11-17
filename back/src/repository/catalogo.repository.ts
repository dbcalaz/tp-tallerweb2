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

    async getOpcionesProducto() {
        const [categorias, marcas] = await Promise.all([
            prisma.categoria.findMany({
                orderBy: { nombre: "asc" },
                select: { id: true, nombre: true, activo: true, tiposProducto: { orderBy: { nombre: "asc" }, select: { id: true, nombre: true, categoriaId: true, activo: true } } },
            }),
            prisma.marca.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true, activo: true } }),
        ]);
        return {
            categorias: categorias.map((categoria) => ({
                id: categoria.id,
                nombre: categoria.nombre,
                imagenUrl: null,
                activo: categoria.activo,
                cantidadProductos: 0,
                tipos: categoria.tiposProducto.map((tipo) => ({ ...tipo, cantidadProductos: 0 })),
            })),
            marcas: marcas.map((marca) => ({ ...marca, cantidadProductos: 0 })),
        };
    }

    crearCategoria(nombre: string, imagenUrl: string | null) {
        return prisma.categoria.create({ data: { nombre, imagenUrl } });
    }

    editarCategoria(id: number, nombre: string, imagenUrl: string | null) {
        return prisma.categoria.update({ where: { id }, data: { nombre, imagenUrl } });
    }

    estadoCategoria(id: number, activo: boolean) {
        return prisma.categoria.update({ where: { id }, data: { activo } });
    }

    crearTipo(nombre: string, categoriaId: number) {
        return prisma.tipoProducto.create({ data: { nombre, categoriaId } });
    }

    editarTipo(id: number, nombre: string, categoriaId: number) {
        return prisma.tipoProducto.update({ where: { id }, data: { nombre, categoriaId } });
    }

    estadoTipo(id: number, activo: boolean) {
        return prisma.tipoProducto.update({ where: { id }, data: { activo } });
    }

    crearMarca(nombre: string) {
        return prisma.marca.create({ data: { nombre } });
    }

    editarMarca(id: number, nombre: string) {
        return prisma.marca.update({ where: { id }, data: { nombre } });
    }

    estadoMarca(id: number, activo: boolean) {
        return prisma.marca.update({ where: { id }, data: { activo } });
    }
}
