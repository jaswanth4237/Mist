import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { LoadingState } from "../components/common/LoadingState";

const DashboardPage    = lazy(() => import("../pages/DashboardPage"));
const FindClientsPage  = lazy(() => import("../pages/FindClientsPage"));
const SavedLeadsPage   = lazy(() => import("../pages/SavedLeadsPage"));
const SearchHistoryPage = lazy(() => import("../pages/SearchHistoryPage"));
const LeadDetailsPage  = lazy(() => import("../pages/LeadDetailsPage"));
const SettingsPage     = lazy(() => import("../pages/SettingsPage"));

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingState className="min-h-screen" />}>
      <Routes>
        <Route path="/"               element={<DashboardPage />} />
        <Route path="/find-clients"   element={<FindClientsPage />} />
        <Route path="/saved-leads"    element={<SavedLeadsPage />} />
        <Route path="/search-history" element={<SearchHistoryPage />} />
        <Route path="/leads/:leadId"  element={<LeadDetailsPage />} />
        <Route path="/settings"       element={<SettingsPage />} />
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">404</h1>
              <p className="text-muted">Page not found</p>
            </div>
          </div>
        } />
      </Routes>
    </Suspense>
  );
}
