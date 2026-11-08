import type { SearchProvider, SearchRequest, SearchResult } from "./SearchProvider.js";
import { logger } from "../../utils/logger.js";
import { env } from "../../config/env.js";

interface TavilySearchResponse {
    results: TavilyResult[];
    query: string;
    answer?: string;
}

interface TavilyResult {
    title: string;
    url: string;
    content: string;
    score: number;
    published_date?: string;
}

export class TavilySearchProvider implements SearchProvider {
    readonly name = "tavily";
    private readonly apiKey: string | undefined;
    private readonly timeoutMs: number;
    private readonly baseUrl = "https://api.tavily.com/search";

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
                "Tavily API key is not configured. Set TAVILY_API_KEY in your .env file."
            );
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            const body = {
                api_key: this.apiKey,
                query: request.query,
                max_results: Math.min(request.maxResults, 20),
                search_depth: "advanced",
                include_answer: false,
                include_raw_content: false,
            };

            logger.debug({ query: request.query, maxResults: request.maxResults }, "Tavily search request");

            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                signal: controller.signal,
            });

            if (response.status === 401 || response.status === 403) {
                throw new SearchProviderError(
                    "SEARCH_PROVIDER_AUTH_ERROR",
                    "Tavily API key is invalid or unauthorized."
                );
            }

            if (response.status === 429) {
                throw new SearchProviderError(
                    "SEARCH_PROVIDER_RATE_LIMIT",
                    "Tavily API rate limit exceeded. Please wait before retrying."
                );
            }

            if (!response.ok) {
                const text = await response.text().catch(() => "Unknown error");
                throw new SearchProviderError(
                    "SEARCH_FAILED",
                    `Tavily search failed with status ${response.status}: ${text}`
                );
            }

            const data = (await response.json()) as TavilySearchResponse;

            if (!Array.isArray(data.results)) {
                logger.warn({ data }, "Tavily returned unexpected response shape");
                return [];
            }

            return data.results.map((r): SearchResult => ({
                title: r.title ?? "",
                url: r.url ?? "",
                snippet: r.content ?? "",
                publishedAt: r.published_date ?? undefined,
                sourceName: this.extractSourceName(r.url),
            }));
        } catch (err) {
            if (err instanceof SearchProviderError) throw err;
            if ((err as Error).name === "AbortError") {
                throw new SearchProviderError(
                    "SEARCH_PROVIDER_TIMEOUT",
                    "Tavily search request timed out."
                );
            }
            throw new SearchProviderError(
                "SEARCH_FAILED",
                `Tavily search encountered an unexpected error: ${(err as Error).message}`
            );
        } finally {
            clearTimeout(timeoutId);
        }
    }

    private extractSourceName(url: string): string | undefined {
        try {
            return new URL(url).hostname.replace(/^www\./, "");
        } catch {
            return undefined;
        }
    }
}

export class SearchProviderError extends Error {
    constructor(
        public readonly code: string,
        message: string
    ) {
        super(message);
        this.name = "SearchProviderError";
    }
}
