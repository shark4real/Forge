/**
 * ════════════════════════════════════════════════════════════════════════
 * HeroSection — Large above-the-fold banner.
 *
 * Displays a headline, subheading, and up to two CTA buttons.
 * ════════════════════════════════════════════════════════════════════════
 */
export interface HeroSectionProps {
  headline: string;
  subheading?: string;
  primaryCta?: string;
  secondaryCta?: string;
  accentColor?: string;
  backgroundStyle?: "gradient" | "solid" | "mesh";
}

function safe(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    const o = val as Record<string, unknown>;
    return safe(o.label ?? o.title ?? o.text ?? o.name ?? "");
  }
  return String(val);
}

export default function HeroSection({
  headline,
  subheading,
  primaryCta,
  secondaryCta,
  accentColor = "#6366f1",
  backgroundStyle = "gradient",
}: HeroSectionProps) {
  const safeHeadline = safe(headline);
  const safeSub = safe(subheading);
  const safePrimary = safe(primaryCta);
  const safeSecondary = safe(secondaryCta);
  const bgClass =
    backgroundStyle === "mesh"
      ? "bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-800 to-gray-900"
      : backgroundStyle === "solid"
        ? "bg-gray-800"
        : "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900";

  return (
    <section
      className={`relative py-20 px-8 text-center ${bgClass} rounded-xl overflow-hidden`}
    >
      {/* Decorative glow */}
      <div
        className="absolute inset-0 opacity-20 blur-3xl pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${accentColor}, transparent 60%)`,
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-white">
          {safeHeadline}
        </h1>
        {safeSub && (
          <p className="text-lg text-gray-300 leading-relaxed">{safeSub}</p>
        )}
        <div className="flex items-center justify-center gap-4 pt-2">
          {safePrimary && (
            <button
              className="px-6 py-2.5 rounded-lg font-semibold text-white transition-transform hover:scale-105"
              style={{ backgroundColor: accentColor }}
            >
              {safePrimary}
            </button>
          )}
          {safeSecondary && (
            <button className="px-6 py-2.5 rounded-lg font-semibold text-gray-300 border border-gray-600 hover:border-gray-400 transition-colors">
              {safeSecondary}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
