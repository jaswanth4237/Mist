import { Router } from "express";
import { createSearchController } from "../controllers/search.controller.js";
import { searchLimiter } from "../middleware/rateLimiter.js";
import type { SearchProvider } from "../providers/search/SearchProvider.js";

export function createSearchesRouter(provider: SearchProvider) {
    const router = Router();
    const controller = createSearchController(provider);

    router.post("/", searchLimiter, controller.create);
    router.get("/", controller.list);
    router.get("/:searchId/leads", controller.getLeads);
    router.get("/:searchId", controller.getById);

    return router;
}
