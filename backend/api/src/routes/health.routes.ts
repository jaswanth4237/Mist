import { Router } from "express";
import type { Request, Response } from "express";
import { testDatabaseConnection } from "../utils/prisma.js";
import type { SearchProvider } from "../providers/search/SearchProvider.js";

export function createHealthRouter(provider: SearchProvider) {
    const router = Router();

    router.get("/", async (req: Request, res: Response) => {
        const dbOk = await testDatabaseConnection();
        const providerConfigured = provider.isConfigured();

        const status = dbOk ? 200 : 503;

        res.status(status).json({
            success: dbOk,
            data: {
                status: dbOk ? "ok" : "degraded",
                database: dbOk ? "connected" : "unavailable",
                searchProvider: {
                    name: provider.name,
                    configured: providerConfigured,
                },
                timestamp: new Date().toISOString(),
                version: "1.0.0",
            },
        });
    });

    return router;
}
