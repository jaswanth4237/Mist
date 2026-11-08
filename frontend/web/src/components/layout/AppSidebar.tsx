import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Bookmark,
  History,
  Settings,
  Target,
  X,
} from "lucide-react";

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  { to: "/", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
  { to: "/find-clients", icon: <Search size={18} />, label: "Find Clients" },
  { to: "/saved-leads", icon: <Bookmark size={18} />, label: "Saved Leads" },
  { to: "/search-history", icon: <History size={18} />, label: "Search History" },
  { to: "/settings", icon: <Settings size={18} />, label: "Settings" },
];

interface AppSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ open = true, onClose }: AppSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && onClose && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30 w-64
          bg-[var(--bg-card)] border-r border-[var(--border)]
          flex flex-col transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center shadow-lg shadow-green-950/40">
              <Target size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-sm text-[var(--text-primary)]">Mist</span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded hover:bg-[var(--bg-hover)]"
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                isActive ? "nav-link-active" : "nav-link"
              }
              onClick={onClose}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer note */}
        <div className="px-5 py-4 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-secondary)]">
            Single-user MVP · No authentication
          </p>
        </div>
      </aside>
    </>
  );
}
