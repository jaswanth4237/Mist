import { z } from "zod";

// ─── Enums ──────────────────────────────────────────────────────────────────

export const ServiceTypeSchema = z.enum([
  "WEBSITE_DEVELOPMENT",
  "APPLICATION_DEVELOPMENT",
  "VIDEO_EDITING",
]);
export type ServiceType = z.infer<typeof ServiceTypeSchema>;

export const HiringIntentSchema = z.enum([
  "EXPLICIT",
  "STRONG_SIGNAL",
  "POSSIBLE",
  "UNKNOWN",
]);
export type HiringIntent = z.infer<typeof HiringIntentSchema>;

export const OpportunityTypeSchema = z.enum([
  "EXPLICIT_REQUEST",
  "CREDIBLE_OPPORTUNITY",
]);
export type OpportunityType = z.infer<typeof OpportunityTypeSchema>;

export const SearchStatusSchema = z.enum([
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "PARTIAL",
  "FAILED",
]);
export type SearchStatus = z.infer<typeof SearchStatusSchema>;

// ─── Request Schemas ─────────────────────────────────────────────────────────

export const CreateSearchRequestSchema = z.object({
  service: ServiceTypeSchema,
  location: z.string().max(100).optional(),
  keywords: z.string().max(300).optional(),
  maxResults: z.number().int().min(1).max(50).default(20),
});
export type CreateSearchRequest = z.infer<typeof CreateSearchRequestSchema>;

export const UpdateSettingsRequestSchema = z.object({
  theme: z.enum(["dark", "light"]),
});
export type UpdateSettingsRequest = z.infer<typeof UpdateSettingsRequestSchema>;

// ─── Response Types ──────────────────────────────────────────────────────────

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

// ─── Lead types ───────────────────────────────────────────────────────────────

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
  opportunityType: OpportunityType;
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

// ─── Query params ─────────────────────────────────────────────────────────────

export const LeadsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  service: ServiceTypeSchema.optional(),
  location: z.string().max(100).optional(),
  hiringIntent: HiringIntentSchema.optional(),
  minScore: z.coerce.number().int().min(0).max(100).optional(),
  sortBy: z
    .enum(["matchScore", "createdAt", "hiringIntent"])
    .default("matchScore"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  searchId: z.string().optional(),
});
export type LeadsQuery = z.infer<typeof LeadsQuerySchema>;

export const SearchesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  service: ServiceTypeSchema.optional(),
  status: SearchStatusSchema.optional(),
});
export type SearchesQuery = z.infer<typeof SearchesQuerySchema>;

export const SavedLeadsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  service: ServiceTypeSchema.optional(),
  sortBy: z.enum(["createdAt", "matchScore"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
export type SavedLeadsQuery = z.infer<typeof SavedLeadsQuerySchema>;

// ─── Service labels ───────────────────────────────────────────────────────────

export const SERVICE_LABELS: Record<ServiceType, string> = {
  WEBSITE_DEVELOPMENT: "Website Development",
  APPLICATION_DEVELOPMENT: "Application Development",
  VIDEO_EDITING: "Video Editing",
};

export const HIRING_INTENT_LABELS: Record<HiringIntent, string> = {
  EXPLICIT: "Explicit Opportunity",
  STRONG_SIGNAL: "Strong Signal",
  POSSIBLE: "Possible Prospect",
  UNKNOWN: "Insufficient Evidence",
};
