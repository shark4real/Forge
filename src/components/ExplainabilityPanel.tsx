/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Explainability Panel
 *
 * The "How this app was built" toggle panel. Shows:
 *   • AI reasoning for the current blueprint
 *   • Per-section component rationale
 *   • Suggested next improvements
 * ════════════════════════════════════════════════════════════════════════
 */

import { Lightbulb, ChevronRight, Sparkles, X } from "lucide-react";
import type { BlueprintExplanation } from "../types/blueprint";

interface ExplainabilityPanelProps {
  explanation: BlueprintExplanation;
  revision: number;
  onClose: () => void;
  onSuggestionClick?: (suggestion: string) => void;
}

export default function ExplainabilityPanel({
  explanation,
  revision,
  onClose,
  onSuggestionClick,
}: ExplainabilityPanelProps) {
  return (
    <div className="w-80 shrink-0 border-l border-gray-700/50 bg-gray-900/95 flex flex-col overflow-hidden animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <Lightbulb size={16} className="text-amber-400" />
          <span className="text-sm font-semibold text-white">How this was built</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Revision badge */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 rounded-full">
            Revision {revision}
          </span>
        </div>

        {/* AI Reasoning */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            AI Reasoning
          </h4>
          <p className="text-sm text-gray-300 leading-relaxed">
            {explanation.reasoning}
          </p>
        </div>

        {/* Component Rationale */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Component Choices
          </h4>
          <div className="space-y-2">
            {(Array.isArray(explanation.componentRationale)
              ? explanation.componentRationale.map((r) => [r.sectionId, r.rationale] as const)
              : Object.entries(explanation.componentRationale)
            ).map(([sectionId, rationale]) => (
              <div
                key={sectionId}
                className="rounded-lg bg-gray-800/60 p-3 border border-gray-700/30"
              >
                <p className="text-xs font-mono text-indigo-400 mb-1">{sectionId}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{rationale}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Improvements */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles size={12} className="text-amber-400" />
            Suggested Improvements
          </h4>
          <div className="space-y-1.5">
            {explanation.suggestedImprovements.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-300 bg-gray-800/40 hover:bg-gray-800 border border-gray-700/30 hover:border-gray-600 transition-colors group"
              >
                <ChevronRight
                  size={12}
                  className="text-gray-500 group-hover:text-indigo-400 transition-colors shrink-0"
                />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
