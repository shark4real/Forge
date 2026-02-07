/**
 * ════════════════════════════════════════════════════════════════════════
 * SettingsPanel — Key-value settings display with toggle / text hints.
 * ════════════════════════════════════════════════════════════════════════
 */
export interface SettingItem {
  label: string;
  description?: string;
  type: "toggle" | "text" | "select";
  value?: string | boolean;
  options?: string[];
}

export interface SettingsPanelProps {
  title?: string;
  settings: SettingItem[];
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

export default function SettingsPanel({
  title = "Settings",
  settings,
  accentColor = "#6366f1",
}: SettingsPanelProps) {
  const safeSettings = Array.isArray(settings) ? settings : [];
  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 divide-y divide-gray-700/40 max-w-lg">
      {title && (
        <div className="px-5 py-3">
          <h3 className="font-semibold text-white">{safe(title)}</h3>
        </div>
      )}
      {safeSettings.map((s, i) => (
        <div key={i} className="flex items-center justify-between px-5 py-3">
          <div>
            <p className="text-sm font-medium text-gray-200">{safe(s.label)}</p>
            {s.description && (
              <p className="text-xs text-gray-500">{safe(s.description)}</p>
            )}
          </div>

          {s.type === "toggle" ? (
            <div
              className="w-10 h-5 rounded-full relative cursor-pointer transition-colors"
              style={{
                backgroundColor:
                  s.value === true || s.value === "true"
                    ? accentColor
                    : "#374151",
              }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                style={{
                  left:
                    s.value === true || s.value === "true"
                      ? "calc(100% - 18px)"
                      : "2px",
                }}
              />
            </div>
          ) : s.type === "select" ? (
            <select className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-300">
              {(Array.isArray(s.options) ? s.options : []).map((o, j) => (
                <option key={j} selected={safe(o) === safe(s.value)}>
                  {safe(o)}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              defaultValue={typeof s.value === "string" ? s.value : safe(s.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-300 w-32"
            />
          )}
        </div>
      ))}
    </div>
  );
}
