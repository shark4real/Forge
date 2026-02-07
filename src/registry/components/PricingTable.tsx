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

function safe(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    const o = val as Record<string, unknown>;
    if (typeof o.label === "string") return o.label;
  }
  return String(val);
}

export default function PricingTable({
  heading,
  tiers,
  accentColor = "#6366f1",
}: PricingTableProps) {
  const safeTiers = Array.isArray(tiers) ? tiers : [];
  return (
    <section className="py-10 px-4">
      {heading && (
        <h2 className="text-2xl font-bold text-center mb-8 text-white">
          {safe(heading)}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {safeTiers.map((tier, i) => {
          const features = Array.isArray(tier.features) ? tier.features.map(safe) : [];
          return (
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
              <h3 className="font-semibold text-lg text-white">{safe(tier.name)}</h3>
              <div className="mt-3 mb-4">
                <span className="text-3xl font-extrabold text-white">
                  {safe(tier.price)}
                </span>
                {tier.period && (
                  <span className="text-sm text-gray-400 ml-1">
                    /{safe(tier.period)}
                  </span>
                )}
              </div>
              <ul className="flex-1 space-y-2 mb-6">
                {features.map((f, j) => (
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
                {safe(tier.ctaLabel) || "Get Started"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
