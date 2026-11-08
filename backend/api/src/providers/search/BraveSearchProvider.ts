import type { SearchProvider, SearchRequest, SearchResult } from "./SearchProvider.js";
import { SearchProviderError } from "./TavilySearchProvider.js";
import { logger } from "../../utils/logger.js";

interface BraveWebResult {
    title: string;
    url: string;
    description: string;
    page_age?: string;
    meta_url?: { hostname?: string };
}

interface BraveSearchResponse {
    web?: { results?: BraveWebResult[] };
}

export class BraveSearchProvider implements SearchProvider {
    readonly name = "brave";
    private readonly apiKey: string | undefined;
    private readonly timeoutMs: number;
    private readonly baseUrl = "https://api.search.brave.com/res/v1/web/search";

    constructor(apiKey?: string, timeoutMs = 20000) {
        this.apiKey = apiKey;
        this.timeoutMs = timeoutMs;
    }

    isConfigured(): boolean {
        return !!this.apiKey;
    }

    async search(request: SearchRequest): Promise<SearchResult[]> {
        if (!this.apiKey) {
            throw new SearchProviderError(
                "SEARCH_PROVIDER_NOT_CONFIGURED",
                "Brave Search API key is not configured. Set BRAVE_SEARCH_API_KEY in your .env file."
            );
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            const params = new URLSearchParams({
                q: request.query,
                count: String(Math.min(request.maxResults, 20)),
            });

            logger.debug({ query: request.query }, "Brave search request");

            const response = await fetch(`${this.baseUrl}?${params}`, {
                headers: {
                    "Accept": "application/json",
                    "Accept-Encoding": "gzip",
                    "X-Subscription-Token": this.apiKey,
                },
                signal: controller.signal,
            });

            if (response.status === 401 || response.status === 403) {
                throw new SearchProviderError("SEARCH_PROVIDER_AUTH_ERROR", "Brave API key is invalid.");
            }
            if (response.status === 429) {
                throw new SearchProviderError("SEARCH_PROVIDER_RATE_LIMIT", "Brave API rate limit exceeded.");
            }
            if (!response.ok) {
                throw new SearchProviderError("SEARCH_FAILED", `Brave search failed: ${response.status}`);
            }

            const data = (await response.json()) as BraveSearchResponse;
            const results = data.web?.results ?? [];

            return results.map((r): SearchResult => ({
                title: r.title ?? "",
                url: r.url ?? "",
                snippet: r.description ?? "",
                publishedAt: r.page_age ?? undefined,
                sourceName: r.meta_url?.hostname ?? this.extractHostname(r.url),
            }));
        } catch (err) {
            if (err instanceof SearchProviderError) throw err;
            if ((err as Error).name === "AbortError") {
                throw new SearchProviderError("SEARCH_PROVIDER_TIMEOUT", "Brave search timed out.");
            }
            throw new SearchProviderError("SEARCH_FAILED", `Brave search error: ${(err as Error).message}`);
        } finally {
            clearTimeout(timeoutId);
        }
    }

    private extractHostname(url: string): string | undefined {
        try {
            return new URL(url).hostname.replace(/^www\./, "");
        } catch {
            return undefined;
        }
    }
}
