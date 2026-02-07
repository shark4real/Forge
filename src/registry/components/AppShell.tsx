/**
 * ════════════════════════════════════════════════════════════════════════
 * AppShell — Top-level application frame.
 *
 * Provides the outermost container with optional sidebar, top bar, and
 * content region. All slots are purely presentational.
 * ════════════════════════════════════════════════════════════════════════
 */
import React from "react";

export interface AppShellProps {
  appName: string;
  /** Optional tagline displayed beneath the app name */
  tagline?: string;
  /** Color theme hint — applied as an accent CSS variable */
  accentColor?: string;
  /** Show a sidebar placeholder */
  showSidebar?: boolean;
  /** Sidebar navigation item labels */
  sidebarItems?: string[];
  children?: React.ReactNode;
}

export default function AppShell({
  appName,
  tagline,
  accentColor = "#6366f1",
  showSidebar = false,
  sidebarItems = [],
  children,
}: AppShellProps) {
  return (
    <div
      className="flex h-full min-h-[480px] rounded-xl border border-gray-700/50 overflow-hidden bg-gray-900"
      style={{ "--app-accent": accentColor } as React.CSSProperties}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      {showSidebar && (
        <aside className="w-56 shrink-0 border-r border-gray-700/50 bg-gray-900/80 flex flex-col">
          <div className="p-4 border-b border-gray-700/50">
            <h2
              className="font-bold text-lg truncate"
              style={{ color: accentColor }}
            >
              {appName}
            </h2>
            {tagline && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">{tagline}</p>
            )}
          </div>
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {sidebarItems.map((item, i) => (
              <button
                key={i}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition-colors"
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>
      )}

      {/* ── Main content ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {!showSidebar && (
          <header className="px-6 py-4 border-b border-gray-700/50 flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: accentColor }}
            >
              {appName.charAt(0)}
            </div>
            <div>
              <h1 className="font-semibold text-white">{appName}</h1>
              {tagline && (
                <p className="text-xs text-gray-400">{tagline}</p>
              )}
            </div>
          </header>
        )}
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}
