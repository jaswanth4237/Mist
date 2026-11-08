import type { ServiceType } from "@clientfinder/shared";
import type { SearchProvider } from "../providers/search/SearchProvider.js";
import { buildSearchQueries } from "./queryBuilder.service.js";
import { analyzeEvidence } from "./evidence.service.js";
import { scoreResult } from "./leadScoring.service.js";
import { deduplicateResults, extractDomain, normalizeUrl } from "./deduplication.service.js";
import { searchRepository } from "../repositories/search.repository.js";
import { leadRepository } from "../repositories/lead.repository.js";
import { logger } from "../utils/logger.js";
import { SearchProviderError } from "../providers/search/TavilySearchProvider.js";

const MIN_SCORE_THRESHOLD = 5; // Leads below this are discarded

export async function runSearch(params: {
    service: ServiceType;
    location?: string;
    keywords?: string;
    maxResults: number;
    provider: SearchProvider;
}) {
    const { service, location, keywords, maxResults, provider } = params;

    // 1. Create search run record
    const searchRun = await searchRepository.create({
        service,
        location,
        keywords,
        provider: provider.name,
    });

    await searchRepository.updateStatus(searchRun.id, "RUNNING", {
        startedAt: new Date(),
    });

    logger.info(
        { searchRunId: searchRun.id, service, location, keywords },
        "Search run started"
    );

    const queries = buildSearchQueries(service, location, keywords, 4);
    const allResults: Awaited<ReturnType<SearchProvider["search"]>> = [];
    let hadError = false;

    // 2. Execute queries
    for (const { query } of queries) {
        try {
            const results = await provider.search({
                query,
                maxResults: Math.min(20, Math.ceil(maxResults / queries.length) + 5),
                location,
            });
            allResults.push(...results);
            logger.debug({ query, resultCount: results.length }, "Query completed");
        } catch (err) {
            hadError = true;
            const msg = err instanceof SearchProviderError ? err.message : String(err);
            const code = err instanceof SearchProviderError ? err.code : "SEARCH_FAILED";

            logger.warn({ query, err: msg, code }, "Query failed");

            // If auth error, abort immediately — retrying won't help
            if (
                err instanceof SearchProviderError &&
                (err.code === "SEARCH_PROVIDER_AUTH_ERROR" ||
                    err.code === "SEARCH_PROVIDER_NOT_CONFIGURED")
            ) {
                await searchRepository.updateStatus(searchRun.id, "FAILED", {
                    completedAt: new Date(),
                    errorCode: code,
                    errorMessage: msg,
                });
                throw err;
            }
        }
    }

    if (allResults.length === 0 && hadError) {
        await searchRepository.updateStatus(searchRun.id, "FAILED", {
            completedAt: new Date(),
            errorCode: "SEARCH_FAILED",
            errorMessage: "All search queries failed.",
        });
        return { searchRun, leads: [] };
    }

    // 3. Deduplicate
    const deduped = deduplicateResults(allResults);

    // 4. Process each result
    const processedLeads = [];

    for (const result of deduped.slice(0, maxResults * 2)) {
        const normalURL = normalizeUrl(result.url);
        if (!normalURL) continue;

        const evidence = analyzeEvidence(result, service, keywords);

        // Skip results with no service relevance
        if (evidence.hiringIntent !== "EXPLICIT" && evidence.hiringIntent !== "STRONG_SIGNAL") {
            continue;
        }

        const scoring = scoreResult(result, evidence, keywords, location);

        if (scoring.score < MIN_SCORE_THRESHOLD) continue;

        const opportunityType: "EXPLICIT_REQUEST" | "CREDIBLE_OPPORTUNITY" =
            scoring.hiringIntent === "EXPLICIT" ? "EXPLICIT_REQUEST" : "CREDIBLE_OPPORTUNITY";
        const companyName = extractCompanyName(result.title);

        // Extract domain
        const domain = extractDomain(normalURL) ?? undefined;

        // Only use websiteUrl if it appears to be the company's own site
        // not a third-party freelance platform listing
        const isListingPlatform = [
            "upwork.com", "freelancer.com", "fiverr.com", "toptal.com",
            "guru.com", "linkedin.com", "reddit.com",
        ].some((d) => (domain ?? "").includes(d));

        processedLeads.push({
            companyName: companyName || undefined,
            websiteUrl: isListingPlatform ? undefined : normalURL,
            domain: isListingPlatform ? undefined : domain,
            location: location || undefined,
            service,
            description: result.snippet?.slice(0, 500) || undefined,
            requestedService: service,
            contactDetails: evidence.contactDetails,
            industry: evidence.industry,
            opportunityType,
            requestDate: result.publishedAt ? new Date(result.publishedAt) : undefined,
            hiringIntent: scoring.hiringIntent,
            matchScore: scoring.score,
            scoreReasons: {
                score: scoring.score,
                reasons: scoring.reasons,
                components: scoring.components,
            },
            sources: [
                {
                    sourceUrl: normalURL,
                    sourceTitle: result.title || undefined,
                    sourceName: result.sourceName || undefined,
                    snippet: result.snippet?.slice(0, 2000) || undefined,
                    evidenceText: evidence.evidenceText?.slice(0, 2000) || undefined,
                    evidenceType: evidence.evidenceType,
                    publishedAt: result.publishedAt ? new Date(result.publishedAt) : undefined,
                },
            ],
        });
    }

    // 5. Sort by score, take top N
    processedLeads.sort((a, b) => b.matchScore - a.matchScore);
    const topLeads = processedLeads.slice(0, maxResults);

    // 6. Persist
    const persistedLeads = [];
    for (const lead of topLeads) {
        try {
            const persisted = await leadRepository.createWithSources(lead, searchRun.id);
            persistedLeads.push(persisted);
        } catch (err) {
            logger.warn({ err }, "Failed to persist lead, skipping");
        }
    }

    // 7. Update search run status
    const finalStatus = hadError && persistedLeads.length > 0 ? "PARTIAL" : "COMPLETED";
    const updatedRun = await searchRepository.updateStatus(searchRun.id, finalStatus, {
        completedAt: new Date(),
        resultCount: persistedLeads.length,
    });

    logger.info(
        { searchRunId: searchRun.id, resultCount: persistedLeads.length, status: finalStatus },
        "Search run completed"
    );

    return { searchRun: updatedRun, leads: persistedLeads };
}

function extractCompanyName(title: string): string {
    if (!title) return "";

    // Remove common suffixes
    const cleaned = title
        .replace(/\s*[-–|]\s*.+$/, "") // Remove everything after dash/pipe
        .replace(/\b(upwork|freelancer|fiverr|linkedin|toptal|guru|reddit)\b.*/i, "")
        .replace(/\[MOCK\]/gi, "")
        .trim();

    // Don't return very short or generic strings
    if (cleaned.length < 3 || /^(job|project|work|hire|need|looking)/i.test(cleaned)) {
        return "";
    }

    return cleaned.slice(0, 100);
}
