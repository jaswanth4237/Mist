import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "../components/layout/PageLayout";
import { LoadingState, EmptyState, ErrorState } from "../components/common/LoadingState";
import { searchesApi } from "../services/searchesApi";
import type { SearchRunDto } from "@clientfinder/shared";
import { SERVICE_LABELS } from "@clientfinder/shared";
import { Search, CheckCircle, AlertTriangle, XCircle, Clock, ChevronRight } from "lucide-react";

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "COMPLETED": return <CheckCircle size={14} className="text-brand-green" />;
    case "PARTIAL":   return <AlertTriangle size={14} className="text-yellow-500" />;
    case "FAILED":    return <XCircle size={14} className="text-brand-red" />;
    default:          return <Clock size={14} className="text-[var(--text-secondary)]" />;
  }
}

export default function SearchHistoryPage() {
  const navigate = useNavigate();
  const [service, setService] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["searches", service, page],
    queryFn: () =>
      searchesApi.list({
        page,
        limit: 20,
        service: (service as SearchRunDto["service"]) || undefined,
      }),
  });

  const searches = data?.data ?? [];
  const meta = data?.meta;

  return (
    <PageLayout title="Search History" subtitle="All previous search runs">
      <div className="space-y-5">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={service}
            onChange={(e) => { setService(e.target.value); setPage(1); }}
            className="input-field w-auto"
            aria-label="Filter by service"
          >
            <option value="">All Services</option>
            <option value="WEBSITE_DEVELOPMENT">Website Development</option>
            <option value="APPLICATION_DEVELOPMENT">Application Development</option>
            <option value="VIDEO_EDITING">Video Editing</option>
          </select>
          {meta && (
            <span className="text-muted text-sm">{meta.total} search{meta.total !== 1 ? "es" : ""}</span>
          )}
        </div>

        {isLoading && <LoadingState message="Loading search history…" />}
        {error && <ErrorState message="Could not load search history." />}

        {!isLoading && !error && searches.length === 0 && (
          <EmptyState
            title="No searches yet"
            description="Your search history will appear here after you run your first search."
            action={
              <button onClick={() => navigate("/find-clients")} className="btn-primary">
                <Search size={16} /> Find Clients
              </button>
            }
            icon={<Search size={48} />}
          />
        )}

        {searches.length > 0 && (
          <div className="space-y-3">
            {searches.map((run) => (
              <div
                key={run.id}
                className="card-hover flex items-center justify-between gap-4 cursor-pointer"
                onClick={() => navigate(`/find-clients?searchId=${run.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate(`/find-clients?searchId=${run.id}`)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <StatusIcon status={run.status} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {SERVICE_LABELS[run.service]}
                    </p>
                    <p className="text-xs text-muted truncate">
                      {[run.location, run.keywords].filter(Boolean).join(" · ") || "No filters"}
                      {" · "}
                      {new Date(run.createdAt).toLocaleString("en-US", {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{run.resultCount}</p>
                    <p className="text-xs text-muted">leads</p>
                  </div>
                  <span className={`badge text-xs ${
                    run.status === "COMPLETED" ? "badge-green" :
                    run.status === "PARTIAL"   ? "badge-yellow" :
                    run.status === "FAILED"    ? "badge-red" : "badge-gray"
                  }`}>
                    {run.status.toLowerCase()}
                  </span>
                  <ChevronRight size={14} className="text-[var(--text-secondary)]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary py-1.5 px-3 text-xs">Previous</button>
            <span className="text-sm text-muted">Page {page} of {meta.totalPages}</span>
            <button disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary py-1.5 px-3 text-xs">Next</button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
