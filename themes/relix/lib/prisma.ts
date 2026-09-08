import path from "path";
import { PrismaClient } from "@prisma/client";

function resolveDatasourceUrl(databaseUrl: string | undefined) {
  if (!databaseUrl) {
    return databaseUrl;
  }

  if (databaseUrl.startsWith("file:")) {
    const filePath = databaseUrl.slice("file:".length);

    if (!filePath || filePath === ":memory:" || path.isAbsolute(filePath)) {
      return databaseUrl;
    }

    const resolvedPath = path.resolve(process.cwd(), "prisma", filePath);
    return `file:${resolvedPath}`;
  }

  if (process.env.NODE_ENV !== "production") {
    try {
      const url = new URL(databaseUrl);

      if (url.protocol === "postgresql:" || url.protocol === "postgres:") {
        const currentLimit = Number(url.searchParams.get("connection_limit") || "0");
        // Turbopack dev can spin up multiple server contexts; keep pool small but allow background sync to coexist.
        if (!Number.isFinite(currentLimit) || currentLimit < 5) {
          url.searchParams.set("connection_limit", "5");
        }

        const currentPoolTimeout = Number(url.searchParams.get("pool_timeout") || "0");
        if (!Number.isFinite(currentPoolTimeout) || currentPoolTimeout < 20) {
          url.searchParams.set("pool_timeout", "20");
        }
      }

      return url.toString();
    } catch {
      return databaseUrl;
    }
  }

  return databaseUrl;
}

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
  prismaDatasourceUrl?: string;
};

const datasourceUrl = resolveDatasourceUrl(process.env.DATABASE_URL);

function createPrismaClient() {
  return new PrismaClient({
    log: ["error"],
    datasources: {
      db: {
        url: datasourceUrl
      }
    }
  });
}

export const prisma =
  globalForPrisma.prisma && globalForPrisma.prismaDatasourceUrl === datasourceUrl
    ? globalForPrisma.prisma
    : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  if (globalForPrisma.prisma && globalForPrisma.prisma !== prisma) {
    void globalForPrisma.prisma.$disconnect().catch(() => undefined);
  }

  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaDatasourceUrl = datasourceUrl;
}
