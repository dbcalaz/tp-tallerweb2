CREATE TABLE "favoritos" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoritos_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "favoritos_userId_productoId_key" ON "favoritos"("userId", "productoId");
CREATE INDEX "favoritos_userId_createdAt_idx" ON "favoritos"("userId", "createdAt");

ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_productoId_fkey"
    FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
