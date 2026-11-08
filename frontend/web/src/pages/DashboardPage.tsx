import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Search, Bookmark, History, TrendingUp, ArrowRight } from "lucide-react";
import { PageLayout } from "../components/layout/PageLayout";
import { LoadingState, ErrorState } from "../components/common/LoadingState";
import { settingsApi } from "../services/settingsApi";
import type { DashboardStatsDto } from "@clientfinder/shared";
import { SERVICE_LABELS } from "@clientfinder/shared";

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-muted text-sm">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-[var(--text-primary)]">{value.toLocaleString()}</p>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => settingsApi.getDashboardStats(),
    refetchInterval: 30000,
  });

  const stats = data?.data as DashboardStatsDto | undefined;

  return (
    <PageLayout title="Dashboard" subtitle="Your client discovery overview">
      {isLoading && <LoadingState message="Loading dashboard…" />}
      {error && (
        <ErrorState
          message="Could not load dashboard stats. Make sure the backend is running."
        />
      )}

      {stats && (
        <div className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Leads"
              value={stats.totalLeads}
              icon={<TrendingUp size={16} className="text-white" />}
              color="bg-brand-green"
            />
            <StatCard
              label="Saved Leads"
              value={stats.savedLeads}
              icon={<Bookmark size={16} className="text-white" />}
              color="bg-brand-green"
            />
            <StatCard
              label="Searches Run"
              value={stats.totalSearches}
              icon={<Search size={16} className="text-white" />}
              color="bg-gray-700"
            />
            <StatCard
              label="Website Dev"
              value={stats.leadsByService.WEBSITE_DEVELOPMENT}
              icon={<TrendingUp size={16} className="text-white" />}
              color="bg-blue-700"
            />
          </div>

          {/* Leads by service */}
          <div className="card">
            <h2 className="section-title mb-4">Leads by Service</h2>
            <div className="space-y-3">
              {(
                [
                  "WEBSITE_DEVELOPMENT",
                  "APPLICATION_DEVELOPMENT",
                  "VIDEO_EDITING",
                ] as const
              ).map((svc) => {
                const count = stats.leadsByService[svc] ?? 0;
                const max = Math.max(1, ...Object.values(stats.leadsByService));
                return (
                  <div key={svc} className="flex items-center gap-3">
                    <span className="text-xs text-muted w-40 flex-shrink-0">
                      {SERVICE_LABELS[svc]}
                    </span>
                    <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-green rounded-full transition-all duration-700"
                        style={{ width: `${(count / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-primary)] w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent searches + CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title">Recent Searches</h2>
                <button
                  onClick={() => navigate("/search-history")}
                  className="text-xs text-brand-red hover:underline flex items-center gap-1"
                >
                  View all <ArrowRight size={12} />
                </button>
              </div>
              {stats.recentSearches.length === 0 ? (
                <p className="text-muted text-sm">No searches yet.</p>
              ) : (
                <ul className="space-y-2">
                  {stats.recentSearches.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {SERVICE_LABELS[s.service as keyof typeof SERVICE_LABELS]}
                        </p>
                        <p className="text-xs text-muted">
                          {s.location ? `${s.location} · ` : ""}
                          {new Date(s.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="badge-gray">{s.resultCount} results</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {stats.totalLeads === 0 && (
              <div className="card bg-gradient-to-br from-green-950/30 to-transparent border-brand-green/20 flex flex-col justify-center items-center text-center p-8">
                <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2">
                  Get Started
                </h3>
                <p className="text-muted text-sm mb-4">
                  Find your first potential clients using real web searches.
                </p>
                <button
                  onClick={() => navigate("/find-clients")}
                  className="btn-primary"
                >
                  <Search size={16} />
                  Find Clients Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
