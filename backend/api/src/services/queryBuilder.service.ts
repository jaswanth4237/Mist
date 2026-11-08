import type { ServiceType } from "@clientfinder/shared";

export interface QueryTemplate {
    query: string;
    weight: number; // Higher = run first
}

const WEBSITE_DEVELOPMENT_QUERIES: QueryTemplate[] = [
    { query: '"need a website" OR "looking for a website" business customer request -jobs -careers -hiring -salary', weight: 10 },
    { query: '"website redesign" OR "new website" business request for proposal -jobs -careers', weight: 9 },
    { query: '"e-commerce website" OR "landing page" business needs help -jobs -careers', weight: 8 },
    { query: '"website development" project request customer -job -career -article', weight: 7 },
    { query: '"seeking a web design agency" OR "website quote" business -jobs -careers', weight: 7 },
];

const APPLICATION_DEVELOPMENT_QUERIES: QueryTemplate[] = [
    { query: '"need a mobile app" OR "looking for an app" business customer request -jobs -careers -hiring', weight: 10 },
    { query: '"app development project" OR "build an app" business request -jobs -careers', weight: 9 },
    { query: '"iOS app" OR "Android app" project request customer -job -career -article', weight: 8 },
    { query: '"custom software" OR "application development" business needs help -jobs -careers', weight: 7 },
    { query: '"app development quote" OR "app development proposal" business -jobs -careers', weight: 7 },
];

const VIDEO_EDITING_QUERIES: QueryTemplate[] = [
    { query: '"need video editing" OR "looking for a video editor" customer request -jobs -careers -hiring', weight: 10 },
    { query: '"promotional video" OR "social media videos" business project request -jobs -careers', weight: 9 },
    { query: '"YouTube video editing" OR "video editing quote" creator business -job -career', weight: 8 },
    { query: '"video editing services" project request customer -jobs -careers -article', weight: 7 },
    { query: '"video editor proposal" OR "video editing project" business needs help -jobs -careers', weight: 7 },
];

const QUERY_MAP: Record<ServiceType, QueryTemplate[]> = {
    WEBSITE_DEVELOPMENT: WEBSITE_DEVELOPMENT_QUERIES,
    APPLICATION_DEVELOPMENT: APPLICATION_DEVELOPMENT_QUERIES,
    VIDEO_EDITING: VIDEO_EDITING_QUERIES,
};

export interface GeneratedQuery {
    query: string;
    weight: number;
}

export function buildSearchQueries(
    service: ServiceType,
    location?: string,
    keywords?: string,
    maxQueries = 4
): GeneratedQuery[] {
    const templates = QUERY_MAP[service] ?? [];

    // Sort by weight descending, take top N
    const sorted = [...templates].sort((a, b) => b.weight - a.weight).slice(0, maxQueries);

    return sorted.map((t) => {
        let query = t.query;

        if (location?.trim()) {
            query = `${query} ${location.trim()}`;
        }

        if (keywords?.trim()) {
            query = `${query} ${keywords.trim()}`;
        }

        return { query, weight: t.weight };
    });
}
