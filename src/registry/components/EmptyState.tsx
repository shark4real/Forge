/**
 * ════════════════════════════════════════════════════════════════════════
 * EmptyState — Friendly placeholder when a section has no data.
 * ════════════════════════════════════════════════════════════════════════
 */
export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  accentColor?: string;
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

export default function EmptyState({
  icon = "📭",
  title,
  description,
  ctaLabel,
  accentColor = "#6366f1",
}: EmptyStateProps) {
  const safeIcon = safe(icon);
  const safeTitle = safe(title) || "Nothing here yet";
  const safeDesc = safe(description);
  const safeCta = safe(ctaLabel);
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <span className="text-5xl mb-4">{safeIcon}</span>
      <h3 className="text-lg font-semibold text-white mb-1">{safeTitle}</h3>
      {safeDesc && (
        <p className="text-sm text-gray-400 max-w-xs mb-4">{safeDesc}</p>
      )}
      {safeCta && (
        <button
          className="px-5 py-2 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: accentColor }}
        >
          {safeCta}
        </button>
      )}
    </div>
  );
}
