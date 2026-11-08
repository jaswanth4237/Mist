import type { SearchResult } from "../providers/search/SearchProvider.js";

export interface NormalizedResult extends SearchResult {
    normalizedUrl: string;
    normalizedDomain: string;
}

const TRACKING_PARAMS = new Set([
    "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
    "ref", "referrer", "fbclid", "gclid", "mc_cid", "mc_eid",
    "yclid", "ocid", "source",
]);

export function normalizeUrl(rawUrl: string): string | null {
    try {
        const url = new URL(rawUrl);
        if (url.protocol !== "http:" && url.protocol !== "https:") return null;
        // Remove tracking params
        for (const param of TRACKING_PARAMS) {
            url.searchParams.delete(param);
        }
        // Normalize trailing slash
        url.pathname = url.pathname.replace(/\/+$/, "") || "/";
        // Force lowercase host
        url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
        return url.toString();
    } catch {
        return null;
    }
}

export function extractDomain(url: string): string | null {
    try {
        return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    } catch {
        return null;
    }
}

export function deduplicateResults(results: SearchResult[]): NormalizedResult[] {
    const seen = new Set<string>();
    const deduped: NormalizedResult[] = [];

    for (const result of results) {
        const normalized = normalizeUrl(result.url);
        if (!normalized) continue; // Skip invalid URLs

        if (seen.has(normalized)) continue;
        seen.add(normalized);

        const domain = extractDomain(normalized) ?? "";

        deduped.push({
            ...result,
            normalizedUrl: normalized,
            normalizedDomain: domain,
        });
    }

    return deduped;
}

/**
 * Check if adding a lead for a given URL would be a duplicate.
 * Used when inserting into DB.
 */
export function buildSourceKey(leadId: string, sourceUrl: string): string {
    const normalized = normalizeUrl(sourceUrl) ?? sourceUrl;
    return `${leadId}::${normalized}`;
}
