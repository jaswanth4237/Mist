import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "../components/layout/PageLayout";
import { LoadingState, ErrorState } from "../components/common/LoadingState";
import { IntentBadge, ServiceBadge, ScoreMeter } from "../components/common/Badge";
import { leadsApi } from "../services/leadsApi";
import {
  ExternalLink, Bookmark, BookmarkCheck, ArrowLeft,
  Globe, MapPin, Calendar, ShieldCheck, Info,
} from "lucide-react";

export default function LeadDetailsPage() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => leadsApi.getById(leadId!),
    enabled: !!leadId,
  });

  const lead = data?.data;

  const saveMutation = useMutation({
    mutationFn: () =>
      lead?.isSaved ? leadsApi.unsave(lead!.id) : leadsApi.save(lead!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["saved-leads"] });
    },
  });

  const formatDate = (d?: string) => {
    if (!d) return null;
    try { return new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }); }
    catch { return null; }
  };

  return (
    <PageLayout title="Lead Details" subtitle="Full evidence and scoring breakdown">
      <div className="max-w-3xl mx-auto space-y-5">
        <button onClick={() => navigate(-1)} className="btn-secondary py-1.5 text-xs">
          <ArrowLeft size={14} /> Back
        </button>

        {isLoading && <LoadingState message="Loading lead details…" />}
        {error && <ErrorState message="Could not load lead details." />}

        {lead && (
          <>
            {/* Header card */}
            <div className="card">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <IntentBadge intent={lead.hiringIntent} />
                    <ServiceBadge service={lead.service} />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    {lead.companyName || lead.sources[0]?.sourceTitle || "Unknown Source"}
                  </h2>
                </div>
                <button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="btn-secondary py-2"
                >
                  {lead.isSaved ? (
                    <><BookmarkCheck size={15} className="text-brand-red" /> Saved</>
                  ) : (
                    <><Bookmark size={15} /> Save</>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)] mb-4">
                {lead.location && (
                  <span className="flex items-center gap-1.5"><MapPin size={14} />{lead.location}</span>
                )}
                {lead.websiteUrl && (
                  <a href={lead.websiteUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-brand-red hover:underline">
                    <Globe size={14} />{lead.domain}
                    <ExternalLink size={11} />
                  </a>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />Discovered: {formatDate(lead.createdAt)}
                </span>
              </div>

              {lead.description && (
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {lead.description}
                </p>
              )}
              <div className="mt-4 space-y-1 text-sm text-[var(--text-secondary)]">
                <p><strong>Opportunity:</strong> {lead.opportunityType === "EXPLICIT_REQUEST" ? "Explicit customer request" : "Credible opportunity"}</p>
                <p><strong>Industry:</strong> {lead.industry || "Not identified from the source"}</p>
                <p><strong>Service required:</strong> {lead.requestedService || lead.service}</p>
                <p><strong>Contact:</strong> {lead.contactDetails || "Contact details not found"}</p>
                <p><strong>Request date:</strong> {formatDate(lead.requestDate) || "Not available"}</p>
              </div>
            </div>

            {/* Score card */}
            <div className="card">
              <h3 className="font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <ShieldCheck size={16} className="text-brand-green" />
                Relevance Score
              </h3>
              <ScoreMeter score={lead.matchScore} />
              <p className="text-xs text-muted mt-2 mb-4">
                Score represents relevance and evidence strength (0–100). It is not a prediction of payment likelihood.
              </p>

              {lead.scoreReasons?.components && (
                <div className="space-y-2 mb-4">
                  {Object.entries(lead.scoreReasons.components).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="text-muted capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                      <span className="font-semibold text-[var(--text-primary)] tabular-nums">{val as number} pts</span>
                    </div>
                  ))}
                </div>
              )}

              {lead.scoreReasons?.reasons && (
                <div className="space-y-1.5">
                  {lead.scoreReasons.reasons.map((reason, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                      <Info size={12} className="flex-shrink-0 mt-0.5 text-brand-red" />
                      {reason}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sources */}
            <div className="card">
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">
                Evidence Sources ({lead.sources.length})
              </h3>
              <div className="space-y-4">
                {lead.sources.map((src) => (
                  <div key={src.id} className="border border-[var(--border)] rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        {src.sourceTitle && (
                          <p className="text-sm font-medium text-[var(--text-primary)] mb-0.5">
                            {src.sourceTitle}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 text-xs text-muted">
                          {src.sourceName && <span>{src.sourceName}</span>}
                          {src.publishedAt && (
                            <span>Published: {formatDate(src.publishedAt)}</span>
                          )}
                          {!src.publishedAt && (
                            <span className="italic">Publication date unavailable</span>
                          )}
                          <span>Discovered: {formatDate(src.discoveredAt)}</span>
                          {src.evidenceType && (
                            <span className="badge-gray">{src.evidenceType.replace(/_/g, " ")}</span>
                          )}
                        </div>
                      </div>
                      <a
                        href={src.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary py-1.5 px-3 text-xs flex-shrink-0"
                      >
                        <ExternalLink size={12} /> Open
                      </a>
                    </div>

                    {src.snippet && (
                      <blockquote className="mt-3 pl-3 border-l-2 border-brand-red text-xs text-[var(--text-secondary)] italic leading-relaxed">
                        {src.snippet}
                      </blockquote>
                    )}
                    <p className="text-xs text-muted mt-2">
                      Note: Evidence is from the search result snippet only. The full source page has not been inspected.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
