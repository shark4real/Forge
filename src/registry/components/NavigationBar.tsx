/**
 * ════════════════════════════════════════════════════════════════════════
 * NavigationBar — Horizontal top navigation.
 *
 * Renders a logo / brand mark plus a flat list of link labels.
 * Purely visual — no routing.
 * ════════════════════════════════════════════════════════════════════════
 */
export interface NavigationBarProps {
  brand: string;
  links: string[];
  ctaLabel?: string;
  accentColor?: string;
}

export default function NavigationBar({
  brand,
  links,
  ctaLabel,
  accentColor = "#6366f1",
}: NavigationBarProps) {
  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-gray-900/90 border-b border-gray-700/50 rounded-t-xl">
      <span className="font-bold text-lg" style={{ color: accentColor }}>
        {brand}
      </span>
      <div className="flex items-center gap-6">
        {links.map((link, i) => (
          <span
            key={i}
            className="text-sm text-gray-300 hover:text-white cursor-pointer transition-colors"
          >
            {link}
          </span>
        ))}
        {ctaLabel && (
          <button
            className="px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: accentColor }}
          >
            {ctaLabel}
          </button>
        )}
      </div>
    </nav>
  );
}
