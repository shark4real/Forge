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

function safe(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    const o = val as Record<string, unknown>;
    if (typeof o.label === "string") return o.label;
    if (typeof o.title === "string") return o.title;
  }
  return String(val);
}

export default function Sidebar({
  brand,
  sections,
  accentColor = "#6366f1",
}: SidebarProps) {
  const safeSections = Array.isArray(sections) ? sections : [];
  return (
    <aside className="w-56 shrink-0 rounded-xl border border-gray-700/50 bg-gray-800/50 flex flex-col overflow-hidden">
      {brand && (
        <div className="px-4 py-3 border-b border-gray-700/50">
          <span className="font-bold" style={{ color: accentColor }}>
            {safe(brand)}
          </span>
        </div>
      )}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {safeSections.map((sec, i) => (
          <div key={i}>
            {sec.heading && (
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 px-2">
                {safe(sec.heading)}
              </p>
            )}
            <div className="space-y-0.5">
              {(Array.isArray(sec.items) ? sec.items : []).map((item, j) => (
                <button
                  key={j}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:bg-gray-700/50 transition-colors"
                >
                  {safe(item)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
