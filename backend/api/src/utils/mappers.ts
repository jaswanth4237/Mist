import type {
    LeadDto,
    LeadSourceDto,
    SearchRunDto,
    ServiceType,
    HiringIntent,
    SearchStatus,
    ScoreReasons,
} from "@clientfinder/shared";

// Use inferred types from prisma queries rather than importing model types directly
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyLead = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySource = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySearchRun = any;

export function mapLeadToDto(lead: AnyLead): LeadDto {
    return {
        id: lead.id,
        companyName: lead.companyName ?? undefined,
        websiteUrl: lead.websiteUrl ?? undefined,
        domain: lead.domain ?? undefined,
        location: lead.location ?? undefined,
        service: lead.service as ServiceType,
        description: lead.description ?? undefined,
        industry: lead.industry ?? undefined,
        requestedService: lead.requestedService ?? undefined,
        contactDetails: lead.contactDetails ?? undefined,
        opportunityType: lead.opportunityType,
        requestDate: lead.requestDate?.toISOString() ?? undefined,
        hiringIntent: lead.hiringIntent as HiringIntent,
        matchScore: lead.matchScore,
        scoreReasons: lead.scoreReasons as unknown as ScoreReasons | undefined,
        isSaved: lead.savedBy !== null && lead.savedBy !== undefined,
        sources: (lead.sources ?? []).map(mapSourceToDto),
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
    };
}

export function mapSourceToDto(source: AnySource): LeadSourceDto {
    return {
        id: source.id,
        sourceUrl: source.sourceUrl,
        sourceTitle: source.sourceTitle ?? undefined,
        sourceName: source.sourceName ?? undefined,
        snippet: source.snippet ?? undefined,
        evidenceText: source.evidenceText ?? undefined,
        evidenceType: source.evidenceType ?? undefined,
        publishedAt: source.publishedAt?.toISOString() ?? undefined,
        discoveredAt: source.discoveredAt.toISOString(),
    };
}

export function mapSearchRunToDto(run: AnySearchRun): SearchRunDto {
    return {
        id: run.id,
        service: run.service as ServiceType,
        location: run.location ?? undefined,
        keywords: run.keywords ?? undefined,
        status: run.status as SearchStatus,
        provider: run.provider,
        resultCount: run.resultCount,
        errorCode: run.errorCode ?? undefined,
        errorMessage: run.errorMessage ?? undefined,
        startedAt: run.startedAt?.toISOString() ?? undefined,
        completedAt: run.completedAt?.toISOString() ?? undefined,
        createdAt: run.createdAt.toISOString(),
        leads: run.leads?.map((sl: AnySearchRun) => mapLeadToDto(sl.lead)),
    };
}
