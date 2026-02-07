/**
 * ════════════════════════════════════════════════════════════════════════
 * NavigationBar — Horizontal top navigation.
 *
 * Renders a logo / brand mark plus a flat list of link labels.
 * Purely visual — no routing.
 * Defensive: never renders raw objects as JSX children.
 * ════════════════════════════════════════════════════════════════════════
 */

/** Safely convert any value to a renderable string */
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

export interface NavigationBarProps {
  brand: string;
  links: unknown[];
  ctaLabel?: unknown;
  accentColor?: string;
}

export default function NavigationBar({
  brand,
  links,
  ctaLabel,
  accentColor = "#6366f1",
}: NavigationBarProps) {
  const safeLinks = Array.isArray(links) ? links.map(safe) : [];
  const safeCta = ctaLabel ? safe(ctaLabel) : undefined;

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-gray-900/90 border-b border-gray-700/50 rounded-t-xl">
      <span className="font-bold text-lg" style={{ color: accentColor }}>
        {safe(brand)}
      </span>
      <div className="flex items-center gap-6">
        {safeLinks.map((link, i) => (
          <span
            key={i}
            className="text-sm text-gray-300 hover:text-white cursor-pointer transition-colors"
          >
            {link}
          </span>
        ))}
        {safeCta && (
          <button
            className="px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: accentColor }}
          >
            {safeCta}
          </button>
        )}
      </div>
    </nav>
  );
}
