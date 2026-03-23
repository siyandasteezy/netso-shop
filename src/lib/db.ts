import { PrismaClient } from "@prisma/client";
// /web forces HTTP-only mode — works in serverless (Netlify) and local dev
import { PrismaLibSql } from "@prisma/adapter-libsql/web";
import path from "path";

function createPrismaClient() {
  const url =
    process.env.TURSO_DATABASE_URL ||
    `file:${path.resolve(process.cwd(), "prisma", "dev.db")}`;
  const adapter = new PrismaLibSql({
    url,
    ...(process.env.TURSO_AUTH_TOKEN ? { authToken: process.env.TURSO_AUTH_TOKEN } : {}),
  });
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
