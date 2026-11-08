import { prisma } from "../utils/prisma.js";
import type { HiringIntent, ServiceType } from "@clientfinder/shared";
import type { ScoreComponents } from "../services/leadScoring.service.js";

export interface CreateLeadData {
    companyName?: string;
    websiteUrl?: string;
    domain?: string;
    location?: string;
    service: ServiceType;
    description?: string;
    industry?: string;
    requestedService?: string;
    contactDetails?: string;
    opportunityType: "EXPLICIT_REQUEST" | "CREDIBLE_OPPORTUNITY";
    requestDate?: Date;
    hiringIntent: HiringIntent;
    matchScore: number;
    scoreReasons: {
        score: number;
        reasons: string[];
        components: ScoreComponents;
    };
    sources: Array<{
        sourceUrl: string;
        sourceTitle?: string;
        sourceName?: string;
        snippet?: string;
        evidenceText?: string;
        evidenceType?: string;
        publishedAt?: Date;
    }>;
}

export const leadRepository = {
    async createWithSources(data: CreateLeadData, searchRunId: string) {
        return prisma.$transaction(async (tx) => {
            const lead = await tx.lead.create({
                data: {
                    companyName: data.companyName,
                    websiteUrl: data.websiteUrl,
                    domain: data.domain,
                    location: data.location,
                    service: data.service,
                    description: data.description,
                    industry: data.industry,
                    requestedService: data.requestedService,
                    contactDetails: data.contactDetails,
                    opportunityType: data.opportunityType,
                    requestDate: data.requestDate,
                    hiringIntent: data.hiringIntent,
                    matchScore: Math.max(0, Math.min(100, data.matchScore)),
                    // Prisma typing for Json field is strict; using unknown bridge
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    scoreReasons: data.scoreReasons as any,
                    sources: {
                        createMany: {
                            data: data.sources.map((s) => ({
                                sourceUrl: s.sourceUrl,
                                sourceTitle: s.sourceTitle,
                                sourceName: s.sourceName,
                                snippet: s.snippet,
                                evidenceText: s.evidenceText,
                                evidenceType: s.evidenceType,
                                publishedAt: s.publishedAt,
                            })),
                            skipDuplicates: true,
                        },
                    },
                    searchRuns: {
                        create: { searchRunId },
                    },
                },
                include: { sources: true, savedBy: true },
            });
            return lead;
        });
    },

    async findMany(params: {
        page: number;
        limit: number;
        service?: ServiceType;
        location?: string;
        hiringIntent?: HiringIntent;
        minScore?: number;
        sortBy: string;
        sortOrder: "asc" | "desc";
        searchId?: string;
    }) {
        const allowedSortFields: Record<string, boolean> = {
            matchScore: true,
            createdAt: true,
            hiringIntent: true,
        };

        const safeSortBy = allowedSortFields[params.sortBy] ? params.sortBy : "matchScore";

        const where = {
            ...(params.service && { service: params.service }),
            ...(params.location && { location: { contains: params.location, mode: "insensitive" as const } }),
            ...(params.hiringIntent && { hiringIntent: params.hiringIntent }),
            ...(params.minScore !== undefined && { matchScore: { gte: params.minScore } }),
            ...(params.searchId && {
                searchRuns: { some: { searchRunId: params.searchId } },
            }),
        };

        const [total, items] = await Promise.all([
            prisma.lead.count({ where }),
            prisma.lead.findMany({
                where,
                orderBy: { [safeSortBy]: params.sortOrder },
                skip: (params.page - 1) * params.limit,
                take: params.limit,
                include: { sources: true, savedBy: true },
            }),
        ]);

        return { total, items };
    },

    async findById(id: string) {
        return prisma.lead.findUnique({
            where: { id },
            include: {
                sources: true,
                savedBy: true,
                searchRuns: { include: { searchRun: true } },
            },
        });
    },

    async saveLead(leadId: string) {
        return prisma.savedLead.upsert({
            where: { leadId },
            create: { leadId },
            update: {},
        });
    },

    async unsaveLead(leadId: string) {
        const result = await prisma.savedLead.deleteMany({ where: { leadId } });
        return result.count > 0;
    },

    async findSavedLeads(params: {
        page: number;
        limit: number;
        service?: ServiceType;
        sortBy: string;
        sortOrder: "asc" | "desc";
    }) {
        const where = {
            ...(params.service && { lead: { service: params.service } }),
        };

        const [total, items] = await Promise.all([
            prisma.savedLead.count({ where }),
            prisma.savedLead.findMany({
                where,
                orderBy:
                    params.sortBy === "matchScore"
                        ? { lead: { matchScore: params.sortOrder } }
                        : { createdAt: params.sortOrder },
                skip: (params.page - 1) * params.limit,
                take: params.limit,
                include: { lead: { include: { sources: true, savedBy: true } } },
            }),
        ]);

        return { total, items };
    },

    async getDashboardStats() {
        const [totalLeads, savedLeads, totalSearches, leadsByService, recentSearches] =
            await Promise.all([
                prisma.lead.count(),
                prisma.savedLead.count(),
                prisma.searchRun.count(),
                prisma.lead.groupBy({ by: ["service"], _count: true }),
                prisma.searchRun.findMany({
                    orderBy: { createdAt: "desc" },
                    take: 5,
                    include: { _count: { select: { leads: true } } },
                }),
            ]);

        return { totalLeads, savedLeads, totalSearches, leadsByService, recentSearches };
    },
};
