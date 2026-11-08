import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Loading…", className = "" }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 gap-3 ${className}`}>
      <Loader2 className="w-8 h-8 text-brand-red animate-spin" />
      <p className="text-muted">{message}</p>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, icon, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 gap-4 text-center ${className}`}>
      {icon && <div className="text-[var(--text-secondary)] opacity-40">{icon}</div>}
      <div>
        <h3 className="font-semibold text-lg text-[var(--text-primary)]">{title}</h3>
        {description && <p className="text-muted mt-1 max-w-md mx-auto">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 gap-4 text-center ${className}`}>
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
        <span className="text-brand-red text-xl">!</span>
      </div>
      <div>
        <h3 className="font-semibold text-lg text-[var(--text-primary)]">{title}</h3>
        <p className="text-muted mt-1 max-w-md mx-auto">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">
          Try again
        </button>
      )}
    </div>
  );
}
