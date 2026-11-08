import type { HiringIntent, ServiceType } from "@clientfinder/shared";
import type { SearchResult } from "../providers/search/SearchProvider.js";

export interface EvidenceAnalysis {
    hiringIntent: HiringIntent;
    evidenceText: string;
    evidenceType: string;
    relevanceScore: number;
    reasons: string[];
    industry?: string;
    contactDetails?: string;
}

const EXPLICIT_REQUEST_PHRASES = [
    "need a website", "need an app", "need video editing", "need a video editor",
    "looking for a website", "looking for an app", "looking for a video editor",
    "seeking a web design agency", "request for proposal", "requesting proposals",
    "please send a quote", "need a quote", "want to redesign", "want a new website",
    "build us a website", "build our app", "edit our videos",
    "hiring a website developer", "hiring an app developer", "hiring a video editor",
];

const CREDIBLE_OPPORTUNITY_PHRASES = [
    "website redesign", "new website", "e-commerce website", "landing page",
    "build a website", "build an app", "app development project", "custom software",
    "promotional video", "social media videos", "video editing project",
    "video editing services", "project brief", "project scope", "budget for",
];

const SERVICE_KEYWORDS: Record<ServiceType, string[]> = {
    WEBSITE_DEVELOPMENT: ["website", "web site", "web development", "landing page", "e-commerce", "ecommerce", "wordpress", "shopify", "woocommerce", "web design", "online store"],
    APPLICATION_DEVELOPMENT: ["app", "application", "mobile app", "android", "ios", "iphone", "flutter", "react native", "cross-platform", "software development", "custom software"],
    VIDEO_EDITING: ["video", "video edit", "video editing", "video editor", "youtube", "reel", "social media video", "promotional video", "footage", "film"],
};

const EXCLUDED_SOURCE_PATTERNS = [
    /\/(jobs?|careers?|vacanc|employment)\b/i,
    /\/(blog|article|news|guide|category|resources?)\b/i,
    /(?:indeed|upwork|freelancer|fiverr|glassdoor|ziprecruiter|rfpmart)\.com/i,
    /\b(job listing|job opening|salary|apply now|employment opportunity|hiring developers?)\b/i,
];

const EXCLUDED_CONTENT_PHRASES = [
    "top companies", "best companies", "companies hiring", "how to hire",
    "website development trends", "guide to", "tutorial", "course",
    "job description", "responsibilities include", "required qualifications",
    "directory of", "list of companies", "freelance jobs", "tips for",
    "how to write", "how to create", "successful request for proposal",
    "government rfp", "web development bids", "web development solicitations",
    "we offer", "our services", "our video editing services", "our web development services",
    "hire our team", "services for businesses",
];

function containsAny(text: string, phrases: string[]): boolean {
    const lower = text.toLowerCase();
    return phrases.some((phrase) => lower.includes(phrase.toLowerCase()));
}

function countMatches(text: string, phrases: string[]): number {
    const lower = text.toLowerCase();
    return phrases.filter((phrase) => lower.includes(phrase.toLowerCase())).length;
}

function extractContactDetails(text: string): string | undefined {
    const email = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0];
    const phone = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim();
    if (email && phone) return `Email: ${email}; Phone: ${phone}`;
    if (email) return `Email: ${email}`;
    if (phone) return `Phone: ${phone}`;
    return undefined;
}

function extractIndustry(text: string): string | undefined {
    const industries = ["restaurant", "retail", "e-commerce", "startup", "nonprofit", "real estate", "healthcare", "education", "agency", "creator", " youtube channel"];
    const match = industries.find((industry) => text.toLowerCase().includes(industry.trim()));
    return match?.trim();
}

function classifyEvidenceType(url: string): string {
    const lower = url.toLowerCase();
    if (/\/(jobs?|careers?)(\/|$)/i.test(lower)) return "excluded_job_listing";
    if (lower.includes("reddit.com")) return "community_post";
    if (lower.includes("linkedin.com")) return "professional_network";
    if (lower.includes("facebook.com") || lower.includes("instagram.com")) return "social_post";
    return "customer_request";
}

export function analyzeEvidence(result: SearchResult, service: ServiceType, userKeywords?: string): EvidenceAnalysis {
    const combinedText = `${result.title} ${result.snippet}`.trim();
    const serviceMatches = countMatches(combinedText, SERVICE_KEYWORDS[service] ?? []);
    const reasons: string[] = [];

    if (serviceMatches === 0) {
        return { hiringIntent: "UNKNOWN", evidenceText: result.snippet, evidenceType: "irrelevant", relevanceScore: 0, reasons: ["The source does not contain evidence for the selected customer service."] };
    }

    if (EXCLUDED_SOURCE_PATTERNS.some((pattern) => pattern.test(result.url)) || containsAny(combinedText, EXCLUDED_CONTENT_PHRASES)) {
        return { hiringIntent: "UNKNOWN", evidenceText: result.snippet, evidenceType: "excluded", relevanceScore: 0, reasons: ["The source is a job listing, hiring article, directory, or other non-customer source."] };
    }

    const explicit = containsAny(combinedText, EXPLICIT_REQUEST_PHRASES);
    const credible = containsAny(combinedText, CREDIBLE_OPPORTUNITY_PHRASES);
    const hiringIntent: HiringIntent = explicit ? "EXPLICIT" : credible && serviceMatches >= 1 ? "STRONG_SIGNAL" : "UNKNOWN";

    if (explicit) reasons.push("The source contains an explicit customer request for the selected service.");
    else if (hiringIntent === "STRONG_SIGNAL") reasons.push("The source shows a credible customer opportunity, but not an explicit request.");
    else reasons.push("The source does not show a customer need for the selected service.");

    if (userKeywords?.trim()) {
        const matches = countMatches(combinedText, userKeywords.split(/\s+/).filter((word) => word.length > 2));
        if (matches > 0) reasons.push(`Matches ${matches} user-provided keyword(s).`);
    }

    return {
        hiringIntent,
        evidenceText: result.snippet.slice(0, 800),
        evidenceType: classifyEvidenceType(result.url),
        relevanceScore: hiringIntent === "UNKNOWN" ? 0 : serviceMatches,
        reasons,
        contactDetails: extractContactDetails(combinedText),
        industry: extractIndustry(combinedText),
    };
}
