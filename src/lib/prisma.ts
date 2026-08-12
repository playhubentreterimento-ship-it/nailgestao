import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "" && !process.env.DATABASE_URL.includes("postgres")) {
    return process.env.DATABASE_URL;
  }

  // Vercel Serverless environment
  if (process.env.VERCEL) {
    const tmpDbPath = "/tmp/dev.db";
    const bundledDbPath = path.join(process.cwd(), "prisma", "dev.db");

    try {
      const tmpDir = path.dirname(tmpDbPath);
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      if (!fs.existsSync(tmpDbPath)) {
        if (fs.existsSync(bundledDbPath)) {
          fs.copyFileSync(bundledDbPath, tmpDbPath);
        } else {
          fs.writeFileSync(tmpDbPath, "");
        }
      }
      fs.chmodSync(tmpDbPath, 0o666);
    } catch (e) {
      console.error("Erro ao preparar SQLite em /tmp no Vercel:", e);
    }

    return `file:${tmpDbPath}`;
  }

  const localDbPath = path.join(process.cwd(), "prisma", "dev.db");
  return `file:${localDbPath}`;
}

const dbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
