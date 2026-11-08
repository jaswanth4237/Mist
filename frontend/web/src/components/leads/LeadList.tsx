import React from "react";
import type { LeadDto } from "@clientfinder/shared";
import { LeadCard } from "./LeadCard";
import { EmptyState, LoadingState } from "../common/LoadingState";
import { Search } from "lucide-react";

interface LeadListProps {
  leads: LeadDto[];
  isLoading: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

export function LeadList({
  leads,
  isLoading,
  emptyTitle = "No leads found",
  emptyDescription = "Run a search to discover potential clients.",
  emptyAction,
}: LeadListProps) {
  if (isLoading) {
    return <LoadingState message="Loading leads…" />;
  }

  if (leads.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        icon={<Search size={48} />}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
}
