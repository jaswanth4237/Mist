import { afterEach, describe, expect, it, vi } from "vitest";
import { BraveSearchProvider } from "../../src/providers/search/BraveSearchProvider";
import { TavilySearchProvider } from "../../src/providers/search/TavilySearchProvider";

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("live search providers", () => {
    it("maps Tavily results to source evidence", async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    results: [
                        {
                            title: "Website developer needed",
                            url: "https://example.com/opportunity",
                            content: "We are looking for a website developer.",
                            score: 0.9,
                            published_date: "2026-11-01T00:00:00Z",
                        },
                    ],
                }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            )
        );
        vi.stubGlobal("fetch", fetchMock);

        const provider = new TavilySearchProvider("test-tavily-key");
        const results = await provider.search({ query: "website developer", maxResults: 5 });

        expect(results).toHaveLength(1);
        expect(results[0]).toMatchObject({
            title: "Website developer needed",
            url: "https://example.com/opportunity",
            snippet: "We are looking for a website developer.",
        });
        expect(fetchMock).toHaveBeenCalledOnce();
    });

    it("maps Brave results to source evidence", async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    web: {
                        results: [
                            {
                                title: "Video editor opportunity",
                                url: "https://example.com/video",
                                description: "Seeking a video editor for weekly content.",
                                meta_url: { hostname: "example.com" },
                            },
                        ],
                    },
                }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            )
        );
        vi.stubGlobal("fetch", fetchMock);

        const provider = new BraveSearchProvider("test-brave-key");
        const results = await provider.search({ query: "video editor", maxResults: 5 });

        expect(results[0]).toMatchObject({
            title: "Video editor opportunity",
            url: "https://example.com/video",
            snippet: "Seeking a video editor for weekly content.",
            sourceName: "example.com",
        });
        expect(fetchMock).toHaveBeenCalledOnce();
    });
});
