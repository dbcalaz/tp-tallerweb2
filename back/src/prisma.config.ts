import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

export class DatabaseNotConfiguredError extends Error {
    constructor() { super("Falta configurar DATABASE_URL en back/.env."); }
}

let prisma: PrismaClient | undefined;
export function getPrisma(): PrismaClient {
    if (prisma) return prisma;
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new DatabaseNotConfiguredError();
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
    return prisma;
}
