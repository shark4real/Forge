/**
 * ════════════════════════════════════════════════════════════════════════
 * FeatureGrid — Grid of feature cards with icon, title, description.
 * ════════════════════════════════════════════════════════════════════════
 */
export interface FeatureItem {
  icon?: string;
  title: string;
  description: string;
}

export interface FeatureGridProps {
  heading?: string;
  features: FeatureItem[];
  columns?: number;
  accentColor?: string;
}

export default function FeatureGrid({
  heading,
  features,
  columns = 3,
  accentColor = "#6366f1",
}: FeatureGridProps) {
  const colClass =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 4
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="py-10 px-4">
      {heading && (
        <h2 className="text-2xl font-bold text-center mb-8 text-white">
          {heading}
        </h2>
      )}
      <div className={`grid ${colClass} gap-5`}>
        {features.map((f, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-700/50 bg-gray-800/60 p-5 hover:border-gray-600 transition-colors"
          >
            {f.icon && (
              <span className="text-2xl mb-3 block">{f.icon}</span>
            )}
            <h3
              className="font-semibold mb-1"
              style={{ color: accentColor }}
            >
              {f.title}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
