import { prisma } from "../prisma.config.js";

export class UsuarioRepository {
    async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
    }

    async findByIdWithCompras(id: number) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                nombre: true,
                apellido: true,
                direccion: true,
                createdAt: true,
                compras: {
                    orderBy: { createdAt: "desc" },
                    include: {
                        detalles: {
                            include: {
                                producto: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async create(data: {
        email: string;
        passwordHash: string;
        nombre: string;
        apellido: string;
        direccion: string;
    }) {
        return prisma.user.create({
            data,
            select: {
                id: true,
                email: true,
                nombre: true,
                apellido: true,
                direccion: true,
                createdAt: true,
            },
        });
    }

    async updateProfile(id: number, data: {
        nombre: string;
        apellido: string;
        direccion: string;
    }) {
        return prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                nombre: true,
                apellido: true,
                direccion: true,
                createdAt: true,
            },
        });
    }
}

