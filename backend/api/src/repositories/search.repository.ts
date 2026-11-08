import { prisma } from "../utils/prisma.js";
import type { SearchStatus, ServiceType } from "@clientfinder/shared";

export const searchRepository = {
    async create(data: {
        service: ServiceType;
        location?: string;
        keywords?: string;
        provider: string;
    }) {
        return prisma.searchRun.create({ data });
    },

    async updateStatus(
        id: string,
        status: SearchStatus,
        extra?: {
            resultCount?: number;
            errorCode?: string;
            errorMessage?: string;
            startedAt?: Date;
            completedAt?: Date;
        }
    ) {
        return prisma.searchRun.update({
            where: { id },
            data: { status, ...extra },
        });
    },

    async findById(id: string) {
        return prisma.searchRun.findUnique({
            where: { id },
            include: {
                leads: {
                    include: {
                        lead: {
                            include: {
                                sources: true,
                                savedBy: true,
                            },
                        },
                    },
                },
            },
        });
    },

    async findMany(params: {
        page: number;
        limit: number;
        service?: ServiceType;
        status?: SearchStatus;
    }) {
        const where = {
            ...(params.service && { service: params.service }),
            ...(params.status && { status: params.status }),
        };

        const [total, items] = await Promise.all([
            prisma.searchRun.count({ where }),
            prisma.searchRun.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (params.page - 1) * params.limit,
                take: params.limit,
                include: { _count: { select: { leads: true } } },
            }),
        ]);

        return { total, items };
    },
};
