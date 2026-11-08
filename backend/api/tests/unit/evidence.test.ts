import { describe, expect, it } from "vitest";
import { analyzeEvidence } from "../../src/services/evidence.service";

describe("evidence.service", () => {
    it("classifies an explicit website request from source evidence", () => {
        const analysis = analyzeEvidence(
            {
                title: "Customer hiring a website developer",
                url: "https://example.com/jobs/website",
                snippet: "We are looking for a website developer to build our company site.",
            },
            "WEBSITE_DEVELOPMENT"
        );

        expect(analysis.hiringIntent).toBe("UNKNOWN");
        expect(analysis.evidenceType).toBe("excluded");
    });

    it("classifies an explicit customer request and extracts public contact details", () => {
        const analysis = analyzeEvidence(
            {
                title: "Restaurant needs a new website",
                url: "https://example.com/request",
                snippet: "We need a website for our restaurant. Contact owner@example.com for the project.",
            },
            "WEBSITE_DEVELOPMENT"
        );

        expect(analysis.hiringIntent).toBe("EXPLICIT");
        expect(analysis.industry).toBe("restaurant");
        expect(analysis.contactDetails).toBe("Email: owner@example.com");
        expect(analysis.evidenceType).toBe("customer_request");
    });

    it("keeps credible opportunities separate from explicit requests", () => {
        const analysis = analyzeEvidence(
            {
                title: "Startup website redesign project",
                url: "https://example.com/project",
                snippet: "A startup is planning a website redesign and is preparing a project scope.",
            },
            "WEBSITE_DEVELOPMENT"
        );

        expect(analysis.hiringIntent).toBe("STRONG_SIGNAL");
        expect(analysis.reasons[0]).toContain("credible customer opportunity");
    });

    it("rejects a provider marketing page without buyer evidence", () => {
        const analysis = analyzeEvidence(
            {
                title: "Professional video editing services",
                url: "https://example.com/video-editing-services",
                snippet: "We offer our video editing services for businesses and creators.",
            },
            "VIDEO_EDITING"
        );

        expect(analysis.hiringIntent).toBe("UNKNOWN");
        expect(analysis.evidenceType).toBe("excluded");
    });

    it("does not classify unrelated content as an opportunity", () => {
        const analysis = analyzeEvidence(
            {
                title: "Website development trends",
                url: "https://example.com/article",
                snippet: "An article about the history of website development.",
            },
            "VIDEO_EDITING"
        );

        expect(analysis.hiringIntent).toBe("UNKNOWN");
        expect(analysis.relevanceScore).toBe(0);
    });
});
