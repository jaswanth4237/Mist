import type { NextFunction, Request, Response } from "express";
import type { ServiceType } from "@clientfinder/shared";
import { UpdateSettingsRequestSchema } from "@clientfinder/shared";
import { settingsRepository } from "../repositories/settings.repository.js";
import { leadRepository } from "../repositories/lead.repository.js";

const mapSettings = (settings: { id: string; theme: string; updatedAt: Date }) => ({
    id: settings.id,
    theme: settings.theme as "dark" | "light",
    updatedAt: settings.updatedAt.toISOString(),
});

export const settingsController = {
    get: async (_req: Request, res: Response, next: NextFunction) => {
        try {
            res.json({ success: true, data: mapSettings(await settingsRepository.getOrCreate()) });
        } catch (err) {
            next(err);
        }
    },

    update: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = UpdateSettingsRequestSchema.parse(req.body);
            res.json({ success: true, data: mapSettings(await settingsRepository.update(body.theme)) });
        } catch (err) {
            next(err);
        }
    },

    dashboardStats: async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = await leadRepository.getDashboardStats();
            const leadsByService = Object.fromEntries(stats.leadsByService.map((group) => [group.service, group._count])) as Record<ServiceType, number>;
            res.json({
                success: true,
                data: {
                    totalLeads: stats.totalLeads,
                    savedLeads: stats.savedLeads,
                    totalSearches: stats.totalSearches,
                    leadsByService: {
                        WEBSITE_DEVELOPMENT: leadsByService.WEBSITE_DEVELOPMENT ?? 0,
                        APPLICATION_DEVELOPMENT: leadsByService.APPLICATION_DEVELOPMENT ?? 0,
                        VIDEO_EDITING: leadsByService.VIDEO_EDITING ?? 0,
                    },
                    recentSearches: stats.recentSearches.map((item) => ({
                        id: item.id,
                        service: item.service,
                        location: item.location,
                        keywords: item.keywords,
                        status: item.status,
                        provider: item.provider,
                        resultCount: item.resultCount,
                        createdAt: item.createdAt.toISOString(),
                    })),
                },
            });
        } catch (err) {
            next(err);
        }
    },
};
