import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function getDatabaseUrl(): string {
  // No Vercel / Serverless (Linux), a raiz do projeto é READ-ONLY.
  // Copiamos o SQLite para /tmp/dev.db e forçamos permissão 0o666 (Leitura/Escrita)
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    try {
      const tmpDir = process.platform === "win32"
        ? path.join(process.cwd(), "node_modules", ".cache")
        : "/tmp";
      
      const tmpDbPath = path.join(tmpDir, "dev.db");

      if (!fs.existsSync(/*turbopackIgnore: true*/ tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      if (!fs.existsSync(/*turbopackIgnore: true*/ tmpDbPath)) {
        const sourcePath = path.join(process.cwd(), "prisma", "dev.db");
        if (fs.existsSync(/*turbopackIgnore: true*/ sourcePath)) {
          fs.copyFileSync(sourcePath, tmpDbPath);
        }
      }

      // CRUCIAL: No Linux/Vercel, fs.copyFileSync herda as permissões 0444 (read-only) do pacote.
      // Damos permissão explícita de LEITURA E ESCRITA (0o666) no arquivo /tmp/dev.db.
      if (fs.existsSync(/*turbopackIgnore: true*/ tmpDbPath)) {
        try {
          fs.chmodSync(tmpDbPath, 0o666);
        } catch (chmodErr) {
          console.warn("Aviso ao alterar permissão do arquivo SQLite em /tmp:", chmodErr);
        }
      }

      return `file:${tmpDbPath}`;
    } catch (e) {
      console.error("Erro ao inicializar banco de dados SQLite em /tmp:", e);
    }
  }

  return process.env.DATABASE_URL || "file:./dev.db";
}

const dbUrl = getDatabaseUrl();
process.env.DATABASE_URL = dbUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
