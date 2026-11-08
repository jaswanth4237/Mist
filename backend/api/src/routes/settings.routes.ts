import { Router } from "express";
import { settingsController } from "../controllers/settings.controller.js";

export function createSettingsRouter() {
    const router = Router();

    router.get("/", settingsController.get);
    router.patch("/", settingsController.update);
    router.get("/dashboard-stats", settingsController.dashboardStats);

    return router;
}
