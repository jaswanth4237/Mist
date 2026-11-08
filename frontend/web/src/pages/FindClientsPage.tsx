import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "../components/layout/PageLayout";
import { ServiceSelector } from "../components/search/ServiceSelector";
import { SearchForm } from "../components/search/SearchForm";
import { LeadList } from "../components/leads/LeadList";
import { ErrorState } from "../components/common/LoadingState";
import { searchesApi } from "../services/searchesApi";
import type { ServiceType, LeadDto, SearchRunDto } from "@clientfinder/shared";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface SearchResult {
  searchRun: SearchRunDto;
  leads: LeadDto[];
}

export default function FindClientsPage() {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: {
      location?: string;
      keywords?: string;
      maxResults: number;
    }) => {
      if (!selectedService) throw new Error("No service selected");
      return searchesApi.create({
        service: selectedService,
        location: data.location || undefined,
        keywords: data.keywords || undefined,
        maxResults: data.maxResults,
      });
    },
    onSuccess: (response) => {
      setSearchResult({
        searchRun: response.data.searchRun,
        leads: response.data.leads,
      });
      queryClient.invalidateQueries({ queryKey: ["searches"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const handleSearch = (data: { location?: string; keywords?: string; maxResults: number }) => {
    setSearchResult(null);
    mutation.mutate(data);
  };

  return (
    <PageLayout
      title="Find Clients"
      subtitle="Discover genuine potential customers using real web searches"
    >
      <div className="space-y-6">
        {/* Step 1: Service */}
        <section>
          <h2 className="section-title mb-1">1. Select a Service</h2>
          <p className="text-muted mb-4">
            Choose the service you offer. We'll search for prospects who are explicitly looking for help.
          </p>
          <ServiceSelector
            selected={selectedService}
            onChange={setSelectedService}
          />
        </section>

        {/* Step 2: Search form */}
        <section className="card">
          <h2 className="section-title mb-4">2. Search Options</h2>
          <SearchForm
            service={selectedService}
            isLoading={mutation.isPending}
            onSubmit={handleSearch}
          />
        </section>

        {/* Status banners */}
        {mutation.isPending && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
            <div className="w-4 h-4 border-2 border-brand-red border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Searching the web…</p>
              <p className="text-xs text-muted">Running real web searches. This may take up to 30 seconds.</p>
            </div>
          </div>
        )}

        {mutation.isError && !mutation.isPending && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
            <AlertCircle size={16} className="text-brand-red flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-brand-red">Search failed</p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                {(mutation.error as Error).message}
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {searchResult && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              {searchResult.searchRun.status === "COMPLETED" && (
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-brand-green" />
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    Search complete — {searchResult.leads.length} leads found
                  </span>
                </div>
              )}
              {searchResult.searchRun.status === "PARTIAL" && (
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-500" />
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    Partial results — {searchResult.leads.length} leads found (some queries failed)
                  </span>
                </div>
              )}
              {searchResult.searchRun.status === "FAILED" && (
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-brand-red" />
                  <span className="text-sm text-brand-red">
                    Search failed: {searchResult.searchRun.errorMessage}
                  </span>
                </div>
              )}
            </div>

            {searchResult.leads.length === 0 &&
              searchResult.searchRun.status !== "FAILED" && (
              <div className="card text-center py-10">
                <p className="font-medium text-[var(--text-primary)] mb-1">No qualifying leads found</p>
                <p className="text-muted text-sm">
                  The search completed but no results met the minimum relevance threshold.
                  Try different keywords or a broader location.
                </p>
              </div>
            )}

            <LeadList
              leads={searchResult.leads}
              isLoading={false}
              emptyTitle=""
              emptyDescription=""
            />
          </section>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-[var(--text-secondary)] text-center border-t border-[var(--border)] pt-4">
          Results are discovered from real web sources. Always verify opportunities independently before contacting prospects.
          No contact information is fabricated, and no estimates of earnings are provided.
        </p>
      </div>
    </PageLayout>
  );
}
