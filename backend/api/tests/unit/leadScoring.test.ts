import { describe, it, expect } from "vitest";
import { scoreResult } from "../../src/services/leadScoring.service";
import type { SearchResult } from "../../src/providers/search/SearchProvider";
import type { EvidenceAnalysis } from "../../src/services/evidence.service";

const makeResult = (overrides: Partial<SearchResult> = {}): SearchResult => ({
    title: "Test",
    url: "https://upwork.com/jobs/test-123",
    snippet: "Looking for a website developer",
    ...overrides,
});

const makeAnalysis = (overrides: Partial<EvidenceAnalysis> = {}): EvidenceAnalysis => ({
    hiringIntent: "EXPLICIT",
    evidenceText: "Looking for a website developer",
    evidenceType: "freelance_listing",
    relevanceScore: 3,
    reasons: ["Explicit hiring request found"],
    ...overrides,
});

describe("leadScoring.service", () => {
    it("gives maximum intent score for EXPLICIT intent", () => {
        const result = scoreResult(makeResult(), makeAnalysis({ hiringIntent: "EXPLICIT" }));
        expect(result.components.hiringIntent).toBe(35);
        expect(result.hiringIntent).toBe("EXPLICIT");
    });

    it("gives zero score for UNKNOWN intent", () => {
        const result = scoreResult(makeResult(), makeAnalysis({ hiringIntent: "UNKNOWN", relevanceScore: 0 }));
        expect(result.components.hiringIntent).toBe(0);
    });

    it("scores recent posts higher", () => {
        const recentResult = makeResult({ publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() });
        const oldResult = makeResult({ publishedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString() });
        const analysis = makeAnalysis();

        const recentScore = scoreResult(recentResult, analysis);
        const oldScore = scoreResult(oldResult, analysis);

        expect(recentScore.components.recency).toBeGreaterThan(oldScore.components.recency);
    });

    it("gives 0 recency points when no publishedAt", () => {
        const result = scoreResult(makeResult({ publishedAt: undefined }), makeAnalysis());
        expect(result.components.recency).toBe(0);
    });

    it("caps score at 100", () => {
        const result = scoreResult(makeResult({ publishedAt: new Date().toISOString() }), makeAnalysis({ relevanceScore: 10 }));
        expect(result.score).toBeLessThanOrEqual(100);
        expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it("gives reliability bonus for freelance platform", () => {
        const upworkResult = makeResult({ url: "https://upwork.com/jobs/test" });
        const unknownResult = makeResult({ url: "https://randomsite.xyz/post" });
        const analysis = makeAnalysis({ hiringIntent: "UNKNOWN", relevanceScore: 0 });

        const upworkScore = scoreResult(upworkResult, analysis);
        const unknownScore = scoreResult(unknownResult, analysis);

        expect(upworkScore.components.sourceReliability).toBeGreaterThan(unknownScore.components.sourceReliability);
    });

    it("includes reasons in output", () => {
        const result = scoreResult(makeResult(), makeAnalysis());
        expect(Array.isArray(result.reasons)).toBe(true);
        expect(result.reasons.length).toBeGreaterThan(0);
    });
});
