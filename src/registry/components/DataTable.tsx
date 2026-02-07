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

export default function DataTable({
  title,
  columns,
  rows,
  accentColor = "#6366f1",
}: DataTableProps) {
  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/40 overflow-hidden">
      {title && (
        <div className="px-5 py-3 border-b border-gray-700/50">
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700/50">
              {columns.map((col, i) => (
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
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-gray-700/30 last:border-0 hover:bg-gray-700/20 transition-colors"
              >
                {columns.map((col, j) => (
                  <td key={j} className="px-5 py-2.5 text-gray-300">
                    {row[col] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
