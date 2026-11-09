import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("Falta configurar DATABASE_URL en back/.env.")
}

const adapter = new PrismaPg({ connectionString })

export const prisma = new PrismaClient({ adapter })

export class DatabaseNotConfiguredError extends Error {
    constructor() { super("Falta configurar DATABASE_URL en back/.env."); }
}

/*export let prisma: PrismaClient | undefined;
export function getPrisma(): PrismaClient {
    if (prisma) return prisma;
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new DatabaseNotConfiguredError();
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
    return prisma;
}*/
