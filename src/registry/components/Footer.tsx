/**
 * ════════════════════════════════════════════════════════════════════════
 * Footer — Simple site footer with column links.
 * ════════════════════════════════════════════════════════════════════════
 */
export interface FooterColumn {
  heading: string;
  links: string[];
}

export interface FooterProps {
  brand?: string;
  columns?: FooterColumn[];
  copyright?: string;
  accentColor?: string;
}

export default function Footer({
  brand,
  columns = [],
  copyright,
  accentColor = "#6366f1",
}: FooterProps) {
  return (
    <footer className="border-t border-gray-700/50 bg-gray-900/80 px-8 py-8 rounded-b-xl">
      <div className="flex flex-wrap gap-12">
        {brand && (
          <div>
            <span className="font-bold text-lg" style={{ color: accentColor }}>
              {brand}
            </span>
          </div>
        )}
        {columns.map((col, i) => (
          <div key={i}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {col.heading}
            </p>
            <ul className="space-y-1">
              {col.links.map((link, j) => (
                <li
                  key={j}
                  className="text-sm text-gray-400 hover:text-white cursor-pointer transition-colors"
                >
                  {link}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {copyright && (
        <p className="text-xs text-gray-600 mt-6">{copyright}</p>
      )}
    </footer>
  );
}
