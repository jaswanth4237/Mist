// Search Provider Interface
export interface SearchRequest {
    query: string;
    maxResults: number;
    location?: string;
}

export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    publishedAt?: string;
    sourceName?: string;
}

export interface SearchProvider {
    readonly name: string;
    isConfigured(): boolean;
    search(request: SearchRequest): Promise<SearchResult[]>;
}
