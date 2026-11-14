import { prisma } from "../prisma.config.js";

export class UsuarioRepository {
    async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
    }

    async replacePasswordResetToken(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
        await prisma.$transaction(async (tx) => {
            await tx.passwordResetToken.deleteMany({ where: { userId } });
            await tx.passwordResetToken.create({
                data: { userId, tokenHash, expiresAt },
            });
        });
    }

    async resetPasswordWithToken(tokenHash: string, passwordHash: string): Promise<boolean> {
        return prisma.$transaction(async (tx) => {
            const now = new Date();
            const resetToken = await tx.passwordResetToken.findUnique({ where: { tokenHash } });
            if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= now) return false;

            const claimed = await tx.passwordResetToken.updateMany({
                where: { id: resetToken.id, usedAt: null, expiresAt: { gt: now } },
                data: { usedAt: now },
            });
            if (claimed.count !== 1) return false;

            await tx.user.update({
                where: { id: resetToken.userId },
                data: { passwordHash },
            });
            await tx.passwordResetToken.updateMany({
                where: { userId: resetToken.userId, usedAt: null },
                data: { usedAt: now },
            });
            return true;
        });
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

