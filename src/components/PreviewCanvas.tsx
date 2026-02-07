/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Preview Canvas
 *
 * The right-hand panel that renders the current UI Blueprint.
 * Shows a device-like frame around the rendered output, with toolbar
 * controls for the explainability toggle and revision info.
 * ════════════════════════════════════════════════════════════════════════
 */

import { Eye, EyeOff, Smartphone, Monitor, RotateCcw } from "lucide-react";
import { useState } from "react";
import BlueprintRenderer from "./BlueprintRenderer";
import type { UIBlueprint } from "../types/blueprint";

interface PreviewCanvasProps {
  blueprint: UIBlueprint | null;
  revision: number;
  showExplainability: boolean;
  onToggleExplainability: () => void;
}

export default function PreviewCanvas({
  blueprint,
  revision,
  showExplainability,
  onToggleExplainability,
}: PreviewCanvasProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  if (!blueprint) {
    return (
      <div className="flex-1 flex items-center justify-center text-center px-8">
        <div>
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center">
            <Monitor size={32} className="text-gray-600" />
          </div>
          <p className="text-gray-500 text-sm">
            Your app will appear here once you describe it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Toolbar ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700/50 bg-gray-900/80 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-400">
            {blueprint.appType}
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full">
            v{revision}
          </span>
          <span className="text-[10px] text-gray-600">
            {blueprint.sections.length} sections ·{" "}
            {blueprint.sections.reduce((n, s) => n + s.components.length, 0)} components
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Device toggle */}
          <button
            onClick={() => setViewMode("desktop")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "desktop" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"
            }`}
            title="Desktop view"
          >
            <Monitor size={14} />
          </button>
          <button
            onClick={() => setViewMode("mobile")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "mobile" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"
            }`}
            title="Mobile view"
          >
            <Smartphone size={14} />
          </button>

          <div className="w-px h-4 bg-gray-700 mx-1" />

          {/* Explainability toggle */}
          <button
            onClick={onToggleExplainability}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${
              showExplainability
                ? "bg-amber-500/20 text-amber-300"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
            }`}
          >
            {showExplainability ? <EyeOff size={12} /> : <Eye size={12} />}
            How it was built
          </button>
        </div>
      </div>

      {/* ── Canvas ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-950/50">
        <div
          className={`mx-auto transition-all duration-300 ${
            viewMode === "mobile" ? "max-w-sm" : "max-w-5xl"
          }`}
        >
          <BlueprintRenderer blueprint={blueprint} />
        </div>
      </div>
    </div>
  );
}
