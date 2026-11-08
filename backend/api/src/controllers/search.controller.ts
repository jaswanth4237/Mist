import type { NextFunction, Request, Response } from "express";
import { CreateSearchRequestSchema, SearchesQuerySchema } from "@clientfinder/shared";
import { runSearch } from "../services/search.service.js";
import { searchRepository } from "../repositories/search.repository.js";
import { mapSearchRunToDto, mapLeadToDto } from "../utils/mappers.js";
import { AppError } from "../middleware/errorHandler.js";
import type { SearchProvider } from "../providers/search/SearchProvider.js";

export function createSearchController(provider: SearchProvider) {
    return {
        create: async (req: Request, res: Response, next: NextFunction) => {
            try {
                const body = CreateSearchRequestSchema.parse(req.body);
                if (!provider.isConfigured()) {
                    throw new AppError(
                        503,
                        "SEARCH_PROVIDER_NOT_CONFIGURED",
                        `Search provider "${provider.name}" is not configured. Please add the API key to your .env file.`
                    );
                }

                const { searchRun, leads } = await runSearch({ ...body, provider });
                res.status(201).json({
                    success: true,
                    data: {
                        searchRun: mapSearchRunToDto(searchRun as Parameters<typeof mapSearchRunToDto>[0]),
                        leads: leads.map((lead) => mapLeadToDto(lead as Parameters<typeof mapLeadToDto>[0])),
                    },
                    meta: { resultCount: leads.length },
                });
            } catch (err) {
                next(err);
            }
        },

        list: async (req: Request, res: Response, next: NextFunction) => {
            try {
                const query = SearchesQuerySchema.parse(req.query);
                const { total, items } = await searchRepository.findMany(query);
                res.json({
                    success: true,
                    data: items.map((item) => mapSearchRunToDto(item as Parameters<typeof mapSearchRunToDto>[0])),
                    meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
                });
            } catch (err) {
                next(err);
            }
        },

        getById: async (req: Request, res: Response, next: NextFunction) => {
            try {
                const searchRun = await searchRepository.findById(req.params.searchId);
                if (!searchRun) throw new AppError(404, "RESOURCE_NOT_FOUND", "Search not found.");
                res.json({ success: true, data: mapSearchRunToDto(searchRun as Parameters<typeof mapSearchRunToDto>[0]) });
            } catch (err) {
                next(err);
            }
        },

        getLeads: async (req: Request, res: Response, next: NextFunction) => {
            try {
                const searchRun = await searchRepository.findById(req.params.searchId);
                if (!searchRun) throw new AppError(404, "RESOURCE_NOT_FOUND", "Search not found.");
                res.json({
                    success: true,
                    data: {
                        searchRun: mapSearchRunToDto(searchRun as Parameters<typeof mapSearchRunToDto>[0]),
                        leads: searchRun.leads?.map((item) => mapLeadToDto(item.lead as Parameters<typeof mapLeadToDto>[0])) ?? [],
                    },
                });
            } catch (err) {
                next(err);
            }
        },
    };
}
