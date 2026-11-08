import React from "react";
import type { HiringIntent } from "@clientfinder/shared";
import { HIRING_INTENT_LABELS, SERVICE_LABELS } from "@clientfinder/shared";
import type { ServiceType } from "@clientfinder/shared";

// ─── Intent Badge ──────────────────────────────────────────────────────────

interface IntentBadgeProps {
  intent: HiringIntent;
}

export function IntentBadge({ intent }: IntentBadgeProps) {
  const classMap: Record<HiringIntent, string> = {
    EXPLICIT: "badge-red",
    STRONG_SIGNAL: "badge-green",
    POSSIBLE: "badge-yellow",
    UNKNOWN: "badge-gray",
  };

  return (
    <span className={classMap[intent]}>
      {HIRING_INTENT_LABELS[intent]}
    </span>
  );
}

// ─── Service Badge ─────────────────────────────────────────────────────────

interface ServiceBadgeProps {
  service: ServiceType;
}

export function ServiceBadge({ service }: ServiceBadgeProps) {
  const classMap: Record<ServiceType, string> = {
    WEBSITE_DEVELOPMENT: "badge-blue",
    APPLICATION_DEVELOPMENT: "badge-green",
    VIDEO_EDITING: "badge-yellow",
  };

  return (
    <span className={classMap[service]}>
      {SERVICE_LABELS[service]}
    </span>
  );
}

// ─── Score Meter ───────────────────────────────────────────────────────────

interface ScoreMeterProps {
  score: number;
}

export function ScoreMeter({ score }: ScoreMeterProps) {
  const color =
    score >= 70
      ? "bg-brand-green"
      : score >= 40
      ? "bg-yellow-500"
      : "bg-brand-red";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-[var(--text-secondary)] tabular-nums w-7 text-right">
        {score}
      </span>
    </div>
  );
}
