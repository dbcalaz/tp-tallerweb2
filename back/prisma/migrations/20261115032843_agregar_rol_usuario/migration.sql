-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('CLIENTE', 'ADMIN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "rol" "Rol" NOT NULL DEFAULT 'CLIENTE';

INSERT INTO "users" ("email", "passwordHash", "nombre", "apellido", "direccion", "rol")
VALUES ('admin@tecnova.com', 'scrypt$86ccea0d6236224e227dc8eaeaf4ae9a$8013050090f97de4083a16676204822417da7da96f2d12751de9bfd4a330a752a0e149a2edaad52ace5ad36975eaa59dd55b8875ede2309a338eaf1eef6d8448', 'Admin', 'Tecnova', '-', 'ADMIN');
