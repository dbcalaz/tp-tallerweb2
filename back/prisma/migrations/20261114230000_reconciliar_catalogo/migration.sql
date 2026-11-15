ALTER TABLE "categorias"
ADD COLUMN "activo" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "categorias"
ADD COLUMN "imagen_url" TEXT;

ALTER TABLE "tipos_productos"
ADD COLUMN "activo" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "marcas"
ADD COLUMN "activo" BOOLEAN NOT NULL DEFAULT true;
