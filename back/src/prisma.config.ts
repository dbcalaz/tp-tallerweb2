import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client/extension"

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("Error")
}

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });