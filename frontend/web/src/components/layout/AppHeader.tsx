import React from "react";
import { Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export function AppHeader({ title, subtitle, onMenuClick }: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-card)]/95 backdrop-blur sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        )}
        <div>
          <h1 className="font-semibold text-lg text-[var(--text-primary)] leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-[var(--text-secondary)]">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          id="theme-toggle"
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
