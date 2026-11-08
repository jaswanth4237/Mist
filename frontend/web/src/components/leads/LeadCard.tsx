import React, { useState } from "react";
import { ExternalLink, Bookmark, BookmarkCheck, Globe, MapPin, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { LeadDto } from "@clientfinder/shared";
import { IntentBadge, ServiceBadge, ScoreMeter } from "../common/Badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "../../services/leadsApi";

interface LeadCardProps {
  lead: LeadDto;
}

export function LeadCard({ lead }: LeadCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [evidenceExpanded, setEvidenceExpanded] = useState(false);

  const primarySource = lead.sources[0];

  const saveMutation = useMutation({
    mutationFn: () =>
      lead.isSaved ? leadsApi.unsave(lead.id) : leadsApi.save(lead.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["saved-leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return null;
    }
  };

  return (
    <article className="card-hover group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <IntentBadge intent={lead.hiringIntent} />
            <ServiceBadge service={lead.service} />
          </div>
          <h3 className="font-semibold text-[var(--text-primary)] text-sm leading-snug truncate">
            {lead.companyName || primarySource?.sourceTitle || "Unknown Source"}
          </h3>
        </div>

        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
          aria-label={lead.isSaved ? "Unsave lead" : "Save lead"}
          title={lead.isSaved ? "Remove from saved" : "Save lead"}
        >
          {lead.isSaved ? (
            <BookmarkCheck size={16} className="text-brand-red" />
          ) : (
            <Bookmark size={16} />
          )}
        </button>
      </div>

      {/* Score */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[var(--text-secondary)]">Relevance score</span>
        </div>
        <ScoreMeter score={lead.matchScore} />
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 mb-3 text-xs text-[var(--text-secondary)]">
        <span className="badge-gray">
          {lead.opportunityType === "EXPLICIT_REQUEST" ? "Explicit customer request" : "Credible opportunity"}
        </span>
        {lead.location && (
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {lead.location}
          </span>
        )}
        {primarySource?.publishedAt && (
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            Published: {formatDate(primarySource.publishedAt)}
          </span>
        )}
        {lead.websiteUrl && (
          <a
            href={lead.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-brand-red hover:underline"
          >
            <Globe size={12} />
            {lead.domain}
          </a>
        )}
      </div>

      <div className="space-y-1 mb-3 text-xs text-[var(--text-secondary)]">
        {lead.industry && <p><strong>Industry:</strong> {lead.industry}</p>}
        <p><strong>Contact:</strong> {lead.contactDetails || "Contact details not found"}</p>
      </div>

      {/* Snippet */}
      {lead.description && (
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3">
          {lead.description}
        </p>
      )}

      {/* Evidence */}
      {primarySource?.snippet && (
        <div className="mb-3">
          <button
            onClick={() => setEvidenceExpanded(!evidenceExpanded)}
            className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {evidenceExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {evidenceExpanded ? "Hide evidence" : "Show evidence"}
          </button>
          {evidenceExpanded && (
            <div className="mt-2 p-3 rounded-lg bg-[var(--bg-hover)] border border-[var(--border)]">
              <p className="text-xs text-[var(--text-secondary)] italic">
                "{primarySource.snippet}"
              </p>
              {primarySource.evidenceType && (
                <span className="badge-gray mt-2 inline-block">
                  {primarySource.evidenceType.replace(/_/g, " ")}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Source & Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-[var(--border)]">
        {primarySource?.sourceUrl && (
          <a
            href={primarySource.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs py-1.5 flex-1"
          >
            <ExternalLink size={12} />
            Open Source
          </a>
        )}
        <button
          onClick={() => navigate(`/leads/${lead.id}`)}
          className="btn-primary text-xs py-1.5 flex-1"
        >
          View Details
        </button>
      </div>
    </article>
  );
}
