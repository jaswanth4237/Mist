import React from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "../components/layout/PageLayout";
import { useTheme } from "../hooks/useTheme";
import { settingsApi } from "../services/settingsApi";
import { Sun, Moon, Info, Server, Search } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get(),
  });

  const { data: healthData } = useQuery({
    queryKey: ["health"],
    queryFn: () => fetch("/api/v1/health").then((r) => r.json()),
    refetchInterval: 60000,
  });

  const health = healthData?.data;

  return (
    <PageLayout title="Settings" subtitle="Application preferences and configuration">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Theme */}
        <section className="card">
          <h2 className="section-title mb-4">Appearance</h2>
          <div className="flex items-center gap-3">
            <button
              id="theme-dark"
              onClick={() => setTheme("dark")}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === "dark" ? "border-brand-red bg-red-50 dark:bg-red-950/20" : "border-[var(--border)]"
              }`}
            >
              <Moon size={22} className={theme === "dark" ? "text-brand-red" : "text-[var(--text-secondary)]"} />
              <span className="text-sm font-medium">Dark Mode</span>
            </button>
            <button
              id="theme-light"
              onClick={() => setTheme("light")}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === "light" ? "border-brand-red bg-red-50 dark:bg-red-950/20" : "border-[var(--border)]"
              }`}
            >
              <Sun size={22} className={theme === "light" ? "text-brand-red" : "text-[var(--text-secondary)]"} />
              <span className="text-sm font-medium">Light Mode</span>
            </button>
          </div>
          <p className="text-xs text-muted mt-3">
            Theme preference is saved locally and synced to the server when available.
          </p>
        </section>

        {/* Search Provider Status */}
        <section className="card">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Search size={16} /> Search Provider
          </h2>
          {health ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">Provider</span>
                <span className="font-medium capitalize">{health.searchProvider?.name ?? "Unknown"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Configured</span>
                <span className={`font-medium ${health.searchProvider?.configured ? "text-brand-green" : "text-brand-red"}`}>
                  {health.searchProvider?.configured ? "✓ Yes" : "✗ API key missing"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Database</span>
                <span className={`font-medium ${health.database === "connected" ? "text-brand-green" : "text-brand-red"}`}>
                  {health.database === "connected" ? "✓ Connected" : "✗ Unavailable"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-muted text-sm">Backend health status unavailable.</p>
          )}
          <div className="mt-4 p-3 rounded-lg bg-[var(--bg-hover)] border border-[var(--border)]">
            <p className="text-xs text-[var(--text-secondary)]">
              To enable real searches, set <code className="bg-[var(--border)] px-1 rounded">TAVILY_API_KEY</code> or{" "}
              <code className="bg-[var(--border)] px-1 rounded">BRAVE_SEARCH_API_KEY</code> in your{" "}
              <code className="bg-[var(--border)] px-1 rounded">.env</code> file.
              API keys are never exposed to the browser.
            </p>
          </div>
        </section>

        {/* App Info */}
        <section className="card">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Info size={16} /> About Mist
          </h2>
          <dl className="space-y-2 text-sm">
            {[
              ["Version", "1.0.0"],
              ["Stack", "React 19 · Node.js · Express · PostgreSQL · Prisma"],
              ["Deployment", "Single-user MVP (no authentication)"],
              ["Data source", "Real web searches via configured provider"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-2">
                <dt className="text-muted">{k}</dt>
                <dd className="font-medium text-[var(--text-primary)] text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Usage guide */}
        <section className="card">
          <h2 className="section-title mb-3 flex items-center gap-2">
            <Server size={16} /> How to Use
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--text-secondary)]">
            <li>Go to <strong className="text-[var(--text-primary)]">Find Clients</strong> and select a service.</li>
            <li>Optionally enter a location and keywords to narrow results.</li>
            <li>Click <strong className="text-[var(--text-primary)]">Find Clients</strong> to run a real web search.</li>
            <li>Review leads ranked by relevance score and hiring intent.</li>
            <li>Click a source link to verify the opportunity independently.</li>
            <li>Save promising leads with the bookmark icon.</li>
            <li>Contact prospects yourself — no automated outreach is included.</li>
          </ol>
          <div className="mt-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30">
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              ⚠️ No contact information, budgets, or earnings are fabricated. Always verify leads independently before contacting prospects.
            </p>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
