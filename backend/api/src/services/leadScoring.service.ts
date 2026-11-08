import type { HiringIntent, ServiceType } from "@clientfinder/shared";
import type { EvidenceAnalysis } from "./evidence.service.js";
import type { SearchResult } from "../providers/search/SearchProvider.js";

export interface ScoreComponents {
    hiringIntent: number;
    evidenceStrength: number;
    recency: number;
    sourceReliability: number;
    keywordMatch: number;
}

export interface ScoringResult {
    score: number;
    hiringIntent: HiringIntent;
    reasons: string[];
    components: ScoreComponents;
}

// Recency scoring thresholds (days → points)
const RECENCY_RULES = [
    { maxDays: 7, points: 20 },
    { maxDays: 30, points: 15 },
    { maxDays: 90, points: 8 },
    { maxDays: Infinity, points: 3 },
];

function scoreRecency(publishedAt?: string): { points: number; reason: string } {
    if (!publishedAt) {
        return { points: 0, reason: "Publication date is unavailable." };
    }

    const published = new Date(publishedAt);
    if (isNaN(published.getTime())) {
        return { points: 0, reason: "Publication date could not be parsed." };
    }

    const ageMs = Date.now() - published.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);

    for (const rule of RECENCY_RULES) {
        if (ageDays <= rule.maxDays) {
            const label =
                ageDays <= 7 ? "within the last 7 days" :
                    ageDays <= 30 ? "within the last 30 days" :
                        ageDays <= 90 ? "within the last 90 days" :
                            "more than 90 days ago";
            return { points: rule.points, reason: `Source was published ${label}.` };
        }
    }

    return { points: 3, reason: "Source is older than 90 days." };
}

function scoreHiringIntent(intent: HiringIntent): { points: number; reason: string } {
    const map: Record<HiringIntent, { points: number; reason: string }> = {
        EXPLICIT: {
            points: 35,
            reason: "Source explicitly requests a service provider or advertises a relevant project.",
        },
        STRONG_SIGNAL: {
            points: 22,
            reason: "Source contains strong evidence of a relevant service need.",
        },
        POSSIBLE: {
            points: 10,
            reason: "Source may indicate a service need, but evidence is limited.",
        },
        UNKNOWN: {
            points: 0,
            reason: "Insufficient evidence to determine hiring intent.",
        },
    };
    return map[intent];
}

function scoreSourceReliability(url: string): { points: number; reason: string } {
    const lower = url.toLowerCase();

    const tier1 = ["upwork.com", "freelancer.com", "fiverr.com", "toptal.com", "guru.com", "linkedin.com/jobs"];
    const tier2 = ["linkedin.com", "reddit.com", "producthunt.com", "twitter.com", "x.com"];

    if (tier1.some((d) => lower.includes(d))) {
        return { points: 10, reason: "Source is a well-known freelance marketplace or job platform." };
    }
    if (tier2.some((d) => lower.includes(d))) {
        return { points: 7, reason: "Source is a recognized professional or community platform." };
    }

    return { points: 3, reason: "Source reliability is unknown." };
}

function scoreEvidenceStrength(analysis: EvidenceAnalysis): { points: number; reason: string } {
    // Based on service keyword match count and hint from analysis
    const relevance = analysis.relevanceScore;

    if (relevance >= 4) {
        return { points: 25, reason: "Multiple service-specific terms found in evidence." };
    }
    if (relevance >= 2) {
        return { points: 15, reason: "Some service-specific terms found in evidence." };
    }
    if (relevance >= 1) {
        return { points: 8, reason: "One service-specific term found in evidence." };
    }
    return { points: 0, reason: "No service-specific terms found in evidence." };
}

function scoreKeywordMatch(
    result: SearchResult,
    userKeywords?: string,
    location?: string
): { points: number; reason: string } {
    if (!userKeywords && !location) {
        return { points: 5, reason: "No user-specified keywords or location to match." };
    }

    const combined = `${result.title} ${result.snippet}`.toLowerCase();
    let matched = 0;

    if (location?.trim()) {
        if (combined.includes(location.toLowerCase())) {
            matched += 5;
        }
    }

    if (userKeywords?.trim()) {
        const words = userKeywords.split(/\s+/).filter((w) => w.length > 2);
        const kwHits = words.filter((w) => combined.includes(w.toLowerCase())).length;
        matched += Math.min(kwHits * 2, 5);
    }

    if (matched >= 8) return { points: 10, reason: "Strong match with location and user keywords." };
    if (matched >= 5) return { points: 7, reason: "Good match with user keywords or location." };
    if (matched >= 2) return { points: 4, reason: "Partial match with user keywords or location." };
    return { points: 1, reason: "Minimal keyword or location match." };
}

export function scoreResult(
    result: SearchResult,
    analysis: EvidenceAnalysis,
    userKeywords?: string,
    location?: string
): ScoringResult {
    const intentScore = scoreHiringIntent(analysis.hiringIntent);
    const evidenceScore = scoreEvidenceStrength(analysis);
    const recencyScore = scoreRecency(result.publishedAt);
    const reliabilityScore = scoreSourceReliability(result.url);
    const keywordScore = scoreKeywordMatch(result, userKeywords, location);

    const components: ScoreComponents = {
        hiringIntent: intentScore.points,
        evidenceStrength: evidenceScore.points,
        recency: recencyScore.points,
        sourceReliability: reliabilityScore.points,
        keywordMatch: keywordScore.points,
    };

    const total = Math.min(
        100,
        components.hiringIntent +
        components.evidenceStrength +
        components.recency +
        components.sourceReliability +
        components.keywordMatch
    );

    const reasons = [
        intentScore.reason,
        evidenceScore.reason,
        recencyScore.reason,
        reliabilityScore.reason,
        keywordScore.reason,
        ...analysis.reasons,
    ].filter(Boolean);

    return {
        score: total,
        hiringIntent: analysis.hiringIntent,
        reasons: [...new Set(reasons)], // deduplicate
        components,
    };
}
