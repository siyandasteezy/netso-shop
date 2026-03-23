import "dotenv/config";
import { defineConfig } from "prisma/config";
import path from "path";

const localDb = `file:${path.resolve(process.cwd(), "prisma", "dev.db")}`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: process.env.TURSO_DATABASE_URL || localDb,
    ...(process.env.TURSO_AUTH_TOKEN ? { authToken: process.env.TURSO_AUTH_TOKEN } : {}),
  },
});
