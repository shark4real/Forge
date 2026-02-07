/**
 * ════════════════════════════════════════════════════════════════════════
 * Sidebar — Vertical navigation panel (standalone, not tied to AppShell).
 * ════════════════════════════════════════════════════════════════════════
 */
export interface SidebarSection {
  heading?: string;
  items: string[];
}

export interface SidebarProps {
  brand?: string;
  sections: SidebarSection[];
  accentColor?: string;
}

export default function Sidebar({
  brand,
  sections,
  accentColor = "#6366f1",
}: SidebarProps) {
  return (
    <aside className="w-56 shrink-0 rounded-xl border border-gray-700/50 bg-gray-800/50 flex flex-col overflow-hidden">
      {brand && (
        <div className="px-4 py-3 border-b border-gray-700/50">
          <span className="font-bold" style={{ color: accentColor }}>
            {brand}
          </span>
        </div>
      )}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {sections.map((sec, i) => (
          <div key={i}>
            {sec.heading && (
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 px-2">
                {sec.heading}
              </p>
            )}
            <div className="space-y-0.5">
              {sec.items.map((item, j) => (
                <button
                  key={j}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:bg-gray-700/50 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
