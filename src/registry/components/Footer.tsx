/**
 * ════════════════════════════════════════════════════════════════════════
 * Footer — Simple site footer with column links.
 * Defensive: converts any objects to strings before rendering.
 * ════════════════════════════════════════════════════════════════════════
 */

function safe(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    const o = val as Record<string, unknown>;
    if (typeof o.label === "string") return o.label;
    if (typeof o.title === "string") return o.title;
    if (typeof o.name === "string") return o.name;
  }
  return String(val);
}

export interface FooterColumn {
  heading: unknown;
  links: unknown[];
}

export interface FooterProps {
  brand?: unknown;
  columns?: FooterColumn[];
  copyright?: unknown;
  accentColor?: string;
}

export default function Footer({
  brand,
  columns = [],
  copyright,
  accentColor = "#6366f1",
}: FooterProps) {
  const safeBrand = brand ? safe(brand) : undefined;
  const safeCopyright = copyright ? safe(copyright) : undefined;
  const safeCols = Array.isArray(columns) ? columns : [];

  return (
    <footer className="border-t border-gray-700/50 bg-gray-900/80 px-8 py-8 rounded-b-xl">
      <div className="flex flex-wrap gap-12">
        {safeBrand && (
          <div>
            <span className="font-bold text-lg" style={{ color: accentColor }}>
              {safeBrand}
            </span>
          </div>
        )}
        {safeCols.map((col, i) => {
          const heading = safe(col?.heading);
          const links = Array.isArray(col?.links) ? col.links.map(safe) : [];
          return (
            <div key={i}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {heading}
              </p>
              <ul className="space-y-1">
                {links.map((link, j) => (
                  <li
                    key={j}
                    className="text-sm text-gray-400 hover:text-white cursor-pointer transition-colors"
                  >
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      {safeCopyright && (
        <p className="text-xs text-gray-600 mt-6">{safeCopyright}</p>
      )}
    </footer>
  );
}
