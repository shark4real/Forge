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

export default function HeroSection({
  headline,
  subheading,
  primaryCta,
  secondaryCta,
  accentColor = "#6366f1",
  backgroundStyle = "gradient",
}: HeroSectionProps) {
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
          {headline}
        </h1>
        {subheading && (
          <p className="text-lg text-gray-300 leading-relaxed">{subheading}</p>
        )}
        <div className="flex items-center justify-center gap-4 pt-2">
          {primaryCta && (
            <button
              className="px-6 py-2.5 rounded-lg font-semibold text-white transition-transform hover:scale-105"
              style={{ backgroundColor: accentColor }}
            >
              {primaryCta}
            </button>
          )}
          {secondaryCta && (
            <button className="px-6 py-2.5 rounded-lg font-semibold text-gray-300 border border-gray-600 hover:border-gray-400 transition-colors">
              {secondaryCta}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
