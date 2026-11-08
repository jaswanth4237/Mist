import type { NextFunction, Request, Response } from "express";
import { LeadsQuerySchema } from "@clientfinder/shared";
import { leadRepository } from "../repositories/lead.repository.js";
import { mapLeadToDto } from "../utils/mappers.js";
import { AppError } from "../middleware/errorHandler.js";

export const leadController = {
    list: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = LeadsQuerySchema.parse(req.query);
            const { total, items } = await leadRepository.findMany(query);
            res.json({
                success: true,
                data: items.map((item) => mapLeadToDto(item as Parameters<typeof mapLeadToDto>[0])),
                meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
            });
        } catch (err) {
            next(err);
        }
    },

    getById: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const lead = await leadRepository.findById(req.params.leadId);
            if (!lead) throw new AppError(404, "RESOURCE_NOT_FOUND", "Lead not found.");
            res.json({ success: true, data: mapLeadToDto(lead as Parameters<typeof mapLeadToDto>[0]) });
        } catch (err) {
            next(err);
        }
    },

    save: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const lead = await leadRepository.findById(req.params.leadId);
            if (!lead) throw new AppError(404, "RESOURCE_NOT_FOUND", "Lead not found.");
            await leadRepository.saveLead(req.params.leadId);
            res.json({ success: true, data: { saved: true, leadId: req.params.leadId } });
        } catch (err) {
            next(err);
        }
    },

    unsave: async (req: Request, res: Response, next: NextFunction) => {
        try {
            await leadRepository.unsaveLead(req.params.leadId);
            res.json({ success: true, data: { saved: false, leadId: req.params.leadId } });
        } catch (err) {
            next(err);
        }
    },
};
