/**
 * ════════════════════════════════════════════════════════════════════════
 * ChartView — Lightweight SVG bar / line / pie chart.
 *
 * Uses inline SVG so there are zero extra dependencies.
 * ════════════════════════════════════════════════════════════════════════
 */
export interface DataPoint {
  label: string;
  value: number;
}

export interface ChartViewProps {
  title?: string;
  data: DataPoint[];
  type?: "bar" | "line" | "pie";
  accentColor?: string;
}

/* ── Helpers ────────────────────────────────────────────────────────── */

const PALETTE = [
  "#6366f1",
  "#22d3ee",
  "#f472b6",
  "#facc15",
  "#34d399",
  "#fb923c",
  "#a78bfa",
  "#f87171",
];

function BarChart({ data, accent }: { data: DataPoint[]; accent: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barW = Math.min(40, 240 / data.length);

  return (
    <svg viewBox={`0 0 ${data.length * (barW + 12) + 20} 160`} className="w-full h-44">
      {data.map((d, i) => {
        const h = (d.value / max) * 120;
        const x = i * (barW + 12) + 10;
        return (
          <g key={i}>
            <rect
              x={x}
              y={140 - h}
              width={barW}
              height={h}
              rx={4}
              fill={accent}
              opacity={0.85}
            />
            <text
              x={x + barW / 2}
              y={155}
              textAnchor="middle"
              className="fill-gray-400 text-[9px]"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ data, accent }: { data: DataPoint[]; accent: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const w = 320;
  const h = 140;
  const gap = w / Math.max(data.length - 1, 1);

  const points = data
    .map((d, i) => `${i * gap + 10},${h - (d.value / max) * (h - 30) - 10}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w + 20} ${h + 20}`} className="w-full h-44">
      <polyline
        points={points}
        fill="none"
        stroke={accent}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((d, i) => {
        const cx = i * gap + 10;
        const cy = h - (d.value / max) * (h - 30) - 10;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={3.5} fill={accent} />
            <text
              x={cx}
              y={h + 14}
              textAnchor="middle"
              className="fill-gray-400 text-[9px]"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function PieChart({ data }: { data: DataPoint[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = 80;
  const cy = 80;
  const r = 70;
  let cumulative = 0;

  const slices = data.map((d, i) => {
    const start = cumulative;
    cumulative += d.value / total;
    const end = cumulative;

    const startAngle = start * Math.PI * 2 - Math.PI / 2;
    const endAngle = end * Math.PI * 2 - Math.PI / 2;
    const largeArc = end - start > 0.5 ? 1 : 0;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    return (
      <path
        key={i}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={PALETTE[i % PALETTE.length]}
        opacity={0.85}
        stroke="#1f2937"
        strokeWidth={1.5}
      />
    );
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" className="w-36 h-36 shrink-0">
        {slices}
      </svg>
      <div className="space-y-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
            />
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */

export default function ChartView({
  title,
  data,
  type = "bar",
  accentColor = "#6366f1",
}: ChartViewProps) {
  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-5">
      {title && (
        <h3 className="font-semibold text-white mb-4">{title}</h3>
      )}
      {type === "bar" && <BarChart data={data} accent={accentColor} />}
      {type === "line" && <LineChart data={data} accent={accentColor} />}
      {type === "pie" && <PieChart data={data} />}
    </div>
  );
}
