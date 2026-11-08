import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { prisma } from "./utils/prisma.js";

const app = createApp();

const server = app.listen(env.API_PORT, () => {
    logger.info(`   Mist API running on http://localhost:${env.API_PORT}`);
    logger.info(`   Environment: ${env.NODE_ENV}`);
    logger.info(`   Search provider: ${env.SEARCH_PROVIDER}`);
    logger.info(`   Database: ${env.DATABASE_URL.replace(/:\/\/.*@/, "://***@")}`);
});

// Graceful shutdown
async function shutdown(signal: string) {
    logger.info({ signal }, "Shutdown signal received");
    server.close(async () => {
        await prisma.$disconnect();
        logger.info("Server and database connections closed.");
        process.exit(0);
    });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught exception");
    process.exit(1);
});
process.on("unhandledRejection", (reason) => {
    logger.fatal({ reason }, "Unhandled promise rejection");
    process.exit(1);
});
