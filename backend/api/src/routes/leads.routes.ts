import { Router } from "express";
import { leadController } from "../controllers/lead.controller.js";

export function createLeadsRouter() {
    const router = Router();

    router.get("/", leadController.list);
    router.get("/:leadId", leadController.getById);
    router.post("/:leadId/save", leadController.save);
    router.delete("/:leadId/save", leadController.unsave);

    return router;
}
