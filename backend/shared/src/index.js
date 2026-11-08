"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HIRING_INTENT_LABELS = exports.SERVICE_LABELS = exports.SavedLeadsQuerySchema = exports.SearchesQuerySchema = exports.LeadsQuerySchema = exports.UpdateSettingsRequestSchema = exports.CreateSearchRequestSchema = exports.SearchStatusSchema = exports.HiringIntentSchema = exports.ServiceTypeSchema = void 0;
const zod_1 = require("zod");
// ─── Enums ──────────────────────────────────────────────────────────────────
exports.ServiceTypeSchema = zod_1.z.enum([
    "WEBSITE_DEVELOPMENT",
    "APPLICATION_DEVELOPMENT",
    "VIDEO_EDITING",
]);
exports.HiringIntentSchema = zod_1.z.enum([
    "EXPLICIT",
    "STRONG_SIGNAL",
    "POSSIBLE",
    "UNKNOWN",
]);
exports.SearchStatusSchema = zod_1.z.enum([
    "PENDING",
    "RUNNING",
    "COMPLETED",
    "PARTIAL",
    "FAILED",
]);
// ─── Request Schemas ─────────────────────────────────────────────────────────
exports.CreateSearchRequestSchema = zod_1.z.object({
    service: exports.ServiceTypeSchema,
    location: zod_1.z.string().max(100).optional(),
    keywords: zod_1.z.string().max(300).optional(),
    maxResults: zod_1.z.number().int().min(1).max(50).default(20),
});
exports.UpdateSettingsRequestSchema = zod_1.z.object({
    theme: zod_1.z.enum(["dark", "light"]),
});
// ─── Query params ─────────────────────────────────────────────────────────────
exports.LeadsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    service: exports.ServiceTypeSchema.optional(),
    location: zod_1.z.string().max(100).optional(),
    hiringIntent: exports.HiringIntentSchema.optional(),
    minScore: zod_1.z.coerce.number().int().min(0).max(100).optional(),
    sortBy: zod_1.z
        .enum(["matchScore", "createdAt", "hiringIntent"])
        .default("matchScore"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
    searchId: zod_1.z.string().optional(),
});
exports.SearchesQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    service: exports.ServiceTypeSchema.optional(),
    status: exports.SearchStatusSchema.optional(),
});
exports.SavedLeadsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    service: exports.ServiceTypeSchema.optional(),
    sortBy: zod_1.z.enum(["createdAt", "matchScore"]).default("createdAt"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
// ─── Service labels ───────────────────────────────────────────────────────────
exports.SERVICE_LABELS = {
    WEBSITE_DEVELOPMENT: "Website Development",
    APPLICATION_DEVELOPMENT: "Application Development",
    VIDEO_EDITING: "Video Editing",
};
exports.HIRING_INTENT_LABELS = {
    EXPLICIT: "Explicit Opportunity",
    STRONG_SIGNAL: "Strong Signal",
    POSSIBLE: "Possible Prospect",
    UNKNOWN: "Insufficient Evidence",
};
//# sourceMappingURL=index.js.map