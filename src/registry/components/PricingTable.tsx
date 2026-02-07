/**
 * ════════════════════════════════════════════════════════════════════════
 * PricingTable — Displays 1-4 pricing tiers side by side.
 * ════════════════════════════════════════════════════════════════════════
 */
export interface PricingTier {
  name: string;
  price: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
  ctaLabel?: string;
}

export interface PricingTableProps {
  heading?: string;
  tiers: PricingTier[];
  accentColor?: string;
}

export default function PricingTable({
  heading,
  tiers,
  accentColor = "#6366f1",
}: PricingTableProps) {
  return (
    <section className="py-10 px-4">
      {heading && (
        <h2 className="text-2xl font-bold text-center mb-8 text-white">
          {heading}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {tiers.map((tier, i) => (
          <div
            key={i}
            className={`rounded-xl border p-6 flex flex-col ${
              tier.highlighted
                ? "border-2 bg-gray-800/80 scale-[1.02]"
                : "border-gray-700/50 bg-gray-800/40"
            }`}
            style={
              tier.highlighted ? { borderColor: accentColor } : undefined
            }
          >
            <h3 className="font-semibold text-lg text-white">{tier.name}</h3>
            <div className="mt-3 mb-4">
              <span className="text-3xl font-extrabold text-white">
                {tier.price}
              </span>
              {tier.period && (
                <span className="text-sm text-gray-400 ml-1">
                  /{tier.period}
                </span>
              )}
            </div>
            <ul className="flex-1 space-y-2 mb-6">
              {tier.features.map((f, j) => (
                <li
                  key={j}
                  className="flex items-start gap-2 text-sm text-gray-300"
                >
                  <span style={{ color: accentColor }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              className="w-full py-2 rounded-lg font-medium text-sm transition-colors"
              style={
                tier.highlighted
                  ? { backgroundColor: accentColor, color: "#fff" }
                  : {
                      border: "1px solid #4b5563",
                      color: "#d1d5db",
                    }
              }
            >
              {tier.ctaLabel || "Get Started"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
