/**
 * ════════════════════════════════════════════════════════════════════════
 * StatsRow — Horizontal row of KPI / stat cards.
 * ════════════════════════════════════════════════════════════════════════
 */
export interface StatItem {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export interface StatsRowProps {
  stats: StatItem[];
  accentColor?: string;
}

export default function StatsRow({
  stats,
  accentColor = "#6366f1",
}: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-4"
        >
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            {s.label}
          </p>
          <p className="text-2xl font-bold text-white">{s.value}</p>
          {s.change && (
            <p
              className="text-xs mt-1 font-medium"
              style={{
                color:
                  s.trend === "up"
                    ? "#22c55e"
                    : s.trend === "down"
                      ? "#ef4444"
                      : accentColor,
              }}
            >
              {s.trend === "up" ? "↑ " : s.trend === "down" ? "↓ " : ""}
              {s.change}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
