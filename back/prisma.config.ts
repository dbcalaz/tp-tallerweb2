import "dotenv/config";
import { defineConfig } from "prisma/config";

process.env["PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK"] ??= "1";

const databaseUrl = process.env["DATABASE_URL"];
const directUrl =
  process.env["DIRECT_URL"] ||
  (databaseUrl ? databaseUrl.replace("-pooler.", ".") : undefined);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: directUrl ? { url: directUrl } : {},
});
