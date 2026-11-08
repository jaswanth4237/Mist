import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "../components/layout/PageLayout";
import { LeadList } from "../components/leads/LeadList";
import { leadsApi } from "../services/leadsApi";
import { settingsApi } from "../services/settingsApi";
import type { LeadDto } from "@clientfinder/shared";
import type { ApiResponse, PaginationMeta } from "@clientfinder/shared";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export default function SavedLeadsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [service, setService] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["saved-leads", service, page],
    queryFn: () =>
      settingsApi.getSavedLeads({
        page,
        limit: 20,
        service: service || undefined,
      }) as Promise<ApiResponse<LeadDto[]> & { meta: PaginationMeta }>,
  });

  const leads = (data?.data ?? []) as LeadDto[];
  const meta = data?.meta as PaginationMeta | undefined;

  return (
    <PageLayout
      title="Saved Leads"
      subtitle="Leads you've bookmarked for follow-up"
    >
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
            <span className="text-muted text-sm">{meta.total} saved lead{meta.total !== 1 ? "s" : ""}</span>
          )}
        </div>

        {error ? (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-sm text-brand-red">
            Could not load saved leads. Make sure the backend is running.
          </div>
        ) : (
          <LeadList
            leads={leads}
            isLoading={isLoading}
            emptyTitle="No saved leads yet"
            emptyDescription="Save promising leads from your searches to find them here."
            emptyAction={
              <button onClick={() => navigate("/find-clients")} className="btn-primary">
                <Search size={16} /> Find Clients
              </button>
            }
          />
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn-secondary py-1.5 px-3 text-xs"
            >
              Previous
            </button>
            <span className="text-sm text-muted">
              Page {page} of {meta.totalPages}
            </span>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary py-1.5 px-3 text-xs"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
