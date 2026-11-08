import { Router } from "express";
import { savedLeadController } from "../controllers/saved-lead.controller.js";

export function createSavedLeadsRouter() {
    const router = Router();
    router.get("/", savedLeadController.list);
    return router;
}
