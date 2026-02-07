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

function safe(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  return String(val);
}

export default function StatsRow({
  stats,
  accentColor = "#6366f1",
}: StatsRowProps) {
  const safeStats = Array.isArray(stats) ? stats : [];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {safeStats.map((s, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-4"
        >
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            {safe(s.label)}
          </p>
          <p className="text-2xl font-bold text-white">{safe(s.value)}</p>
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
              {safe(s.change)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
