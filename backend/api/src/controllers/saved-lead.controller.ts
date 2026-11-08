import type { NextFunction, Request, Response } from "express";
import { SavedLeadsQuerySchema } from "@clientfinder/shared";
import { leadRepository } from "../repositories/lead.repository.js";
import { mapLeadToDto } from "../utils/mappers.js";

export const savedLeadController = {
    list: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = SavedLeadsQuerySchema.parse(req.query);
            const { total, items } = await leadRepository.findSavedLeads(query);
            res.json({
                success: true,
                data: items.map((item) => mapLeadToDto(item.lead as Parameters<typeof mapLeadToDto>[0])),
                meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
            });
        } catch (err) {
            next(err);
        }
    },
};
