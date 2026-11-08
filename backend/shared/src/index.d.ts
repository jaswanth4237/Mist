import { z } from "zod";
export declare const ServiceTypeSchema: z.ZodEnum<["WEBSITE_DEVELOPMENT", "APPLICATION_DEVELOPMENT", "VIDEO_EDITING"]>;
export type ServiceType = z.infer<typeof ServiceTypeSchema>;
export declare const HiringIntentSchema: z.ZodEnum<["EXPLICIT", "STRONG_SIGNAL", "POSSIBLE", "UNKNOWN"]>;
export type HiringIntent = z.infer<typeof HiringIntentSchema>;
export declare const SearchStatusSchema: z.ZodEnum<["PENDING", "RUNNING", "COMPLETED", "PARTIAL", "FAILED"]>;
export type SearchStatus = z.infer<typeof SearchStatusSchema>;
export declare const CreateSearchRequestSchema: z.ZodObject<{
    service: z.ZodEnum<["WEBSITE_DEVELOPMENT", "APPLICATION_DEVELOPMENT", "VIDEO_EDITING"]>;
    location: z.ZodOptional<z.ZodString>;
    keywords: z.ZodOptional<z.ZodString>;
    maxResults: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    maxResults: number;
    service: "WEBSITE_DEVELOPMENT" | "APPLICATION_DEVELOPMENT" | "VIDEO_EDITING";
    location?: string | undefined;
    keywords?: string | undefined;
}, {
    service: "WEBSITE_DEVELOPMENT" | "APPLICATION_DEVELOPMENT" | "VIDEO_EDITING";
    maxResults?: number | undefined;
    location?: string | undefined;
    keywords?: string | undefined;
}>;
export type CreateSearchRequest = z.infer<typeof CreateSearchRequestSchema>;
export declare const UpdateSettingsRequestSchema: z.ZodObject<{
    theme: z.ZodEnum<["dark", "light"]>;
}, "strip", z.ZodTypeAny, {
    theme: "dark" | "light";
}, {
    theme: "dark" | "light";
}>;
export type UpdateSettingsRequest = z.infer<typeof UpdateSettingsRequestSchema>;
export interface ApiResponse<T = unknown> {
    success: true;
    data: T;
    meta?: Record<string, unknown>;
}
export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        requestId?: string;
    };
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface LeadSourceDto {
    id: string;
    sourceUrl: string;
    sourceTitle?: string;
    sourceName?: string;
    snippet?: string;
    evidenceText?: string;
    evidenceType?: string;
    publishedAt?: string;
    discoveredAt: string;
}
export interface ScoreReasons {
    score: number;
    reasons: string[];
    components: {
        hiringIntent: number;
        evidenceStrength: number;
        recency: number;
        sourceReliability: number;
        keywordMatch: number;
    };
}
export interface LeadDto {
    id: string;
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
    requestDate?: string;
    hiringIntent: HiringIntent;
    matchScore: number;
    scoreReasons?: ScoreReasons;
    isSaved: boolean;
    sources: LeadSourceDto[];
    createdAt: string;
    updatedAt: string;
}
export interface SearchRunDto {
    id: string;
    service: ServiceType;
    location?: string;
    keywords?: string;
    status: SearchStatus;
    provider: string;
    resultCount: number;
    errorCode?: string;
    errorMessage?: string;
    startedAt?: string;
    completedAt?: string;
    createdAt: string;
    leads?: LeadDto[];
}
export interface AppSettingsDto {
    id: string;
    theme: "dark" | "light";
    updatedAt: string;
}
export interface DashboardStatsDto {
    totalLeads: number;
    savedLeads: number;
    totalSearches: number;
    leadsByService: Record<ServiceType, number>;
    recentSearches: SearchRunDto[];
}
export declare const LeadsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    service: z.ZodOptional<z.ZodEnum<["WEBSITE_DEVELOPMENT", "APPLICATION_DEVELOPMENT", "VIDEO_EDITING"]>>;
    location: z.ZodOptional<z.ZodString>;
    hiringIntent: z.ZodOptional<z.ZodEnum<["EXPLICIT", "STRONG_SIGNAL", "POSSIBLE", "UNKNOWN"]>>;
    minScore: z.ZodOptional<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["matchScore", "createdAt", "hiringIntent"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    searchId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "hiringIntent" | "matchScore" | "createdAt";
    sortOrder: "asc" | "desc";
    service?: "WEBSITE_DEVELOPMENT" | "APPLICATION_DEVELOPMENT" | "VIDEO_EDITING" | undefined;
    location?: string | undefined;
    hiringIntent?: "EXPLICIT" | "STRONG_SIGNAL" | "POSSIBLE" | "UNKNOWN" | undefined;
    minScore?: number | undefined;
    searchId?: string | undefined;
}, {
    limit?: number | undefined;
    service?: "WEBSITE_DEVELOPMENT" | "APPLICATION_DEVELOPMENT" | "VIDEO_EDITING" | undefined;
    location?: string | undefined;
    page?: number | undefined;
    hiringIntent?: "EXPLICIT" | "STRONG_SIGNAL" | "POSSIBLE" | "UNKNOWN" | undefined;
    minScore?: number | undefined;
    sortBy?: "hiringIntent" | "matchScore" | "createdAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    searchId?: string | undefined;
}>;
export type LeadsQuery = z.infer<typeof LeadsQuerySchema>;
export declare const SearchesQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    service: z.ZodOptional<z.ZodEnum<["WEBSITE_DEVELOPMENT", "APPLICATION_DEVELOPMENT", "VIDEO_EDITING"]>>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "RUNNING", "COMPLETED", "PARTIAL", "FAILED"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    status?: "PENDING" | "RUNNING" | "COMPLETED" | "PARTIAL" | "FAILED" | undefined;
    service?: "WEBSITE_DEVELOPMENT" | "APPLICATION_DEVELOPMENT" | "VIDEO_EDITING" | undefined;
}, {
    status?: "PENDING" | "RUNNING" | "COMPLETED" | "PARTIAL" | "FAILED" | undefined;
    limit?: number | undefined;
    service?: "WEBSITE_DEVELOPMENT" | "APPLICATION_DEVELOPMENT" | "VIDEO_EDITING" | undefined;
    page?: number | undefined;
}>;
export type SearchesQuery = z.infer<typeof SearchesQuerySchema>;
export declare const SavedLeadsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    service: z.ZodOptional<z.ZodEnum<["WEBSITE_DEVELOPMENT", "APPLICATION_DEVELOPMENT", "VIDEO_EDITING"]>>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "matchScore"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "matchScore" | "createdAt";
    sortOrder: "asc" | "desc";
    service?: "WEBSITE_DEVELOPMENT" | "APPLICATION_DEVELOPMENT" | "VIDEO_EDITING" | undefined;
}, {
    limit?: number | undefined;
    service?: "WEBSITE_DEVELOPMENT" | "APPLICATION_DEVELOPMENT" | "VIDEO_EDITING" | undefined;
    page?: number | undefined;
    sortBy?: "matchScore" | "createdAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type SavedLeadsQuery = z.infer<typeof SavedLeadsQuerySchema>;
export declare const SERVICE_LABELS: Record<ServiceType, string>;
export declare const HIRING_INTENT_LABELS: Record<HiringIntent, string>;
//# sourceMappingURL=index.d.ts.map