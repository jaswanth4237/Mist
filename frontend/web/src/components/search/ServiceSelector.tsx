import React from "react";
import { Globe, Smartphone, Video } from "lucide-react";
import type { ServiceType } from "@clientfinder/shared";
import { SERVICE_LABELS } from "@clientfinder/shared";

interface ServiceConfig {
  type: ServiceType;
  icon: React.ReactNode;
  description: string;
  examples: string[];
}

const SERVICES: ServiceConfig[] = [
  {
    type: "WEBSITE_DEVELOPMENT",
    icon: <Globe size={28} />,
    description: "Find businesses seeking website development, redesigns, landing pages, or e-commerce.",
    examples: [
      "Website redesign requests",
      "E-commerce development",
      "Landing page projects",
      "Business sites",
    ],
  },
  {
    type: "APPLICATION_DEVELOPMENT",
    icon: <Smartphone size={28} />,
    description: "Find companies seeking Android, iOS, cross-platform, or custom application developers.",
    examples: [
      "Android app projects",
      "iOS development",
      "Cross-platform apps",
      "App maintenance",
    ],
  },
  {
    type: "VIDEO_EDITING",
    icon: <Video size={28} />,
    description: "Find businesses, creators, and organizations publicly seeking video editing services.",
    examples: [
      "YouTube channels",
      "Promotional videos",
      "Social media content",
      "Corporate video",
    ],
  },
];

interface ServiceSelectorProps {
  selected: ServiceType | null;
  onChange: (service: ServiceType) => void;
}

export function ServiceSelector({ selected, onChange }: ServiceSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {SERVICES.map((svc) => {
        const isSelected = selected === svc.type;
        return (
          <button
            key={svc.type}
            id={`service-${svc.type.toLowerCase()}`}
            onClick={() => onChange(svc.type)}
            className={`
              text-left p-5 rounded-xl border-2 transition-all duration-150 focus:outline-none
              focus:ring-2 focus:ring-brand-green focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]
              ${
                isSelected
                  ? "border-brand-green bg-green-50 dark:bg-[#0b2a17] shadow-lg shadow-green-950/30"
                  : "border-[var(--border)] bg-[var(--bg-card)] hover:border-brand-green/50 hover:bg-[var(--bg-hover)]"
              }
            `}
          >
            <div
              className={`mb-3 ${
                isSelected ? "text-brand-green" : "text-[var(--text-secondary)]"
              }`}
            >
              {svc.icon}
            </div>
            <h3
              className={`font-semibold mb-1.5 ${
                isSelected ? "text-brand-green" : "text-[var(--text-primary)]"
              }`}
            >
              {SERVICE_LABELS[svc.type]}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
              {svc.description}
            </p>
            <ul className="space-y-1">
              {svc.examples.map((ex) => (
                <li key={ex} className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-current inline-block" />
                  {ex}
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
