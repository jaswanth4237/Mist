import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log:
            process.env.NODE_ENV === "development"
                ? [{ level: "warn", emit: "stdout" }, { level: "error", emit: "stdout" }]
                : [{ level: "error", emit: "stdout" }],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export async function testDatabaseConnection(): Promise<boolean> {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (err) {
        logger.debug({ err }, "Database connection check failed");
        return false;
    }
}
