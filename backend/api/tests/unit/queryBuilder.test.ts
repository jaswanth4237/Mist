import { describe, it, expect } from "vitest";
import { buildSearchQueries } from "../../src/services/queryBuilder.service";

describe("queryBuilder.service", () => {
    it("generates queries for WEBSITE_DEVELOPMENT", () => {
        const queries = buildSearchQueries("WEBSITE_DEVELOPMENT");
        expect(queries.length).toBeGreaterThan(0);
        expect(queries[0].query.toLowerCase()).toMatch(/website|web/);
    });

    it("generates queries for APPLICATION_DEVELOPMENT", () => {
        const queries = buildSearchQueries("APPLICATION_DEVELOPMENT");
        expect(queries.length).toBeGreaterThan(0);
        expect(queries[0].query.toLowerCase()).toMatch(/app/);
    });

    it("generates queries for VIDEO_EDITING", () => {
        const queries = buildSearchQueries("VIDEO_EDITING");
        expect(queries.length).toBeGreaterThan(0);
        expect(queries[0].query.toLowerCase()).toMatch(/video/);
    });

    it("appends location to queries", () => {
        const queries = buildSearchQueries("WEBSITE_DEVELOPMENT", "India");
        expect(queries[0].query).toContain("India");
    });

    it("appends keywords to queries", () => {
        const queries = buildSearchQueries("WEBSITE_DEVELOPMENT", undefined, "startup");
        expect(queries[0].query).toContain("startup");
    });

    it("respects maxQueries limit", () => {
        const queries = buildSearchQueries("WEBSITE_DEVELOPMENT", undefined, undefined, 2);
        expect(queries.length).toBeLessThanOrEqual(2);
    });
});
