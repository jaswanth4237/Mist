import { describe, it, expect } from "vitest";
import { deduplicateResults, normalizeUrl, extractDomain } from "../../src/services/deduplication.service";
import type { SearchResult } from "../../src/providers/search/SearchProvider";

describe("deduplication.service", () => {
    describe("normalizeUrl", () => {
        it("removes tracking params", () => {
            const normalized = normalizeUrl("https://example.com/page?utm_source=google&utm_medium=cpc");
            expect(normalized).toBe("https://example.com/page");
        });

        it("normalizes trailing slashes", () => {
            const normalized = normalizeUrl("https://example.com/page/");
            expect(normalized).toBe("https://example.com/page");
        });

        it("lowercases hostname", () => {
            const normalized = normalizeUrl("https://WWW.EXAMPLE.COM/page");
            expect(normalized).toBe("https://example.com/page");
        });

        it("returns null for invalid URL", () => {
            expect(normalizeUrl("not-a-url")).toBeNull();
        });
    });

    describe("extractDomain", () => {
        it("extracts domain without www", () => {
            expect(extractDomain("https://www.example.com/page")).toBe("example.com");
        });
    });

    describe("deduplicateResults", () => {
        const makeResult = (url: string): SearchResult => ({
            title: "Test",
            url,
            snippet: "Test snippet",
        });

        it("removes duplicate URLs", () => {
            const results = [
                makeResult("https://example.com/job?utm_source=google"),
                makeResult("https://example.com/job"),
            ];
            const deduped = deduplicateResults(results);
            expect(deduped.length).toBe(1);
        });

        it("keeps distinct URLs", () => {
            const results = [
                makeResult("https://upwork.com/job1"),
                makeResult("https://upwork.com/job2"),
            ];
            const deduped = deduplicateResults(results);
            expect(deduped.length).toBe(2);
        });

        it("skips invalid URLs", () => {
            const results = [makeResult("not-valid")];
            const deduped = deduplicateResults(results);
            expect(deduped.length).toBe(0);
        });
    });
});
