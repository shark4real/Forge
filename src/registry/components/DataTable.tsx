/**
 * ════════════════════════════════════════════════════════════════════════
 * DataTable — Simple tabular data display.
 * ════════════════════════════════════════════════════════════════════════
 */
export interface DataTableProps {
  title?: string;
  columns: string[];
  rows: Record<string, string | number>[];
  accentColor?: string;
}

function safe(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    const o = val as Record<string, unknown>;
    if (typeof o.label === "string") return o.label;
    if (typeof o.name === "string") return o.name;
  }
  return String(val);
}

export default function DataTable({
  title,
  columns,
  rows,
  accentColor = "#6366f1",
}: DataTableProps) {
  const safeCols = Array.isArray(columns) ? columns.map(safe) : [];
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/40 overflow-hidden">
      {title && (
        <div className="px-5 py-3 border-b border-gray-700/50">
          <h3 className="font-semibold text-white">{safe(title)}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700/50">
              {safeCols.map((col, i) => (
                <th
                  key={i}
                  className="text-left px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: accentColor }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {safeRows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-gray-700/30 last:border-0 hover:bg-gray-700/20 transition-colors"
              >
                {safeCols.map((col, j) => {
                  const cellVal = row && typeof row === "object" ? (row as Record<string, unknown>)[col] : undefined;
                  return (
                    <td key={j} className="px-5 py-2.5 text-gray-300">
                      {cellVal !== undefined && cellVal !== null ? safe(cellVal) : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
