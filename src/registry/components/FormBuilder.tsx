/**
 * ════════════════════════════════════════════════════════════════════════
 * FormBuilder — Renders a dynamic form from a field definition array.
 * ════════════════════════════════════════════════════════════════════════
 */
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "textarea" | "select" | "checkbox";
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface FormBuilderProps {
  title?: string;
  description?: string;
  fields: FormField[];
  submitLabel?: string;
  accentColor?: string;
}

function safe(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  return String(val);
}

export default function FormBuilder({
  title,
  description,
  fields,
  submitLabel = "Submit",
  accentColor = "#6366f1",
}: FormBuilderProps) {
  const safeFields = Array.isArray(fields) ? fields : [];
  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-6 max-w-lg">
      {title && <h3 className="text-lg font-semibold text-white mb-1">{safe(title)}</h3>}
      {description && (
        <p className="text-sm text-gray-400 mb-5">{safe(description)}</p>
      )}
      <form
        className="space-y-4"
        onSubmit={(e) => e.preventDefault()}
      >
        {safeFields.map((f, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">
              {safe(f.label)}
              {f.required && <span className="text-red-400 ml-0.5">*</span>}
            </label>

            {f.type === "textarea" ? (
              <textarea
                placeholder={safe(f.placeholder)}
                rows={3}
                className="rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            ) : f.type === "select" ? (
              <select className="rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                <option value="">{safe(f.placeholder) || "Select…"}</option>
                {(Array.isArray(f.options) ? f.options : []).map((o, j) => (
                  <option key={j} value={safe(o)}>
                    {safe(o)}
                  </option>
                ))}
              </select>
            ) : f.type === "checkbox" ? (
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  className="rounded bg-gray-900 border-gray-600"
                />
                {safe(f.placeholder) || safe(f.label)}
              </label>
            ) : (
              <input
                type={f.type}
                placeholder={safe(f.placeholder)}
                className="rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          className="w-full mt-2 py-2.5 rounded-lg font-medium text-sm text-white transition-transform hover:scale-[1.01]"
          style={{ backgroundColor: accentColor }}
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
