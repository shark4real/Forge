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

export default function EmptyState({
  icon = "📭",
  title,
  description,
  ctaLabel,
  accentColor = "#6366f1",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 max-w-xs mb-4">{description}</p>
      )}
      {ctaLabel && (
        <button
          className="px-5 py-2 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: accentColor }}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
