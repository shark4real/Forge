/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Blueprint Renderer (v2 — crash-proof)
 *
 * Takes a NORMALIZED UIBlueprint and renders it as a live React tree.
 *
 * Safety guarantees:
 *   1. Components resolved STRICTLY from the registry — unknown → FallbackComponent
 *   2. Every component wrapped in a per-component error boundary
 *   3. One broken component never unmounts the entire app
 *   4. Props validated via Zod safeParse with silent fallback
 *   5. Preview always renders SOMETHING — even if partially invalid
 * ════════════════════════════════════════════════════════════════════════
 */

import React, { createElement } from "react";
import type { UIBlueprint, BlueprintSection, BlueprintComponent } from "../types/blueprint";
import { getRegistryEntry } from "../registry";

/* ── Props ─────────────────────────────────────────────────────────── */

export interface BlueprintRendererProps {
  blueprint: UIBlueprint;
}

/* ── Per-component error boundary ──────────────────────────────────── */

class ComponentErrorBoundary extends React.Component<
  { name: string; children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  state = { hasError: false, errorMsg: "" };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error?.message ?? "Unknown render error" };
  }

  componentDidCatch(error: Error) {
    console.warn(`[Forge Renderer] Component "${this.props.name}" crashed:`, error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          <span className="font-semibold">⚠ Render warning</span>
          <span className="text-amber-400/70 ml-1">— {this.props.name}</span>
          <p className="text-xs text-amber-400/50 mt-1">{this.state.errorMsg}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Fallback for unknown components ───────────────────────────────── */

function FallbackComponent({ name }: { name: string }) {
  return (
    <div className="rounded-lg border border-gray-700/30 bg-gray-800/30 p-3 text-sm text-gray-500 italic">
      Component "{name}" is not in the registry — skipped.
    </div>
  );
}

/* ── Single component renderer ─────────────────────────────────────── */

function RenderComponent({
  entry,
  globalAccent,
}: {
  entry: BlueprintComponent;
  globalAccent?: string;
}) {
  const reg = getRegistryEntry(entry.componentName);

  if (!reg) {
    return <FallbackComponent name={entry.componentName} />;
  }

  // Merge global accent if component didn't specify one
  const mergedProps = {
    ...(globalAccent && !entry.props.accentColor ? { accentColor: globalAccent } : {}),
    ...entry.props,
  };

  // Validate via Zod — use safeParse so bad data degrades gracefully
  const parsed = reg.propsSchema.safeParse(mergedProps);
  const validProps = parsed.success ? parsed.data : mergedProps;

  return (
    <ComponentErrorBoundary name={entry.componentName}>
      {createElement(reg.component, validProps)}
    </ComponentErrorBoundary>
  );
}

/* ── Section renderer ──────────────────────────────────────────────── */

function RenderSection({
  section,
  globalAccent,
}: {
  section: BlueprintSection;
  globalAccent?: string;
}) {
  return (
    <div className="animate-fade-in" style={{ animationDelay: "0.05s" }}>
      {section.heading && (
        <h2 className="text-xl font-bold text-white mb-4">{section.heading}</h2>
      )}
      <div className="space-y-5">
        {section.components.map((comp, i) => (
          <RenderComponent key={`${section.id}-${i}`} entry={comp} globalAccent={globalAccent} />
        ))}
      </div>
    </div>
  );
}

/* ── Main renderer ─────────────────────────────────────────────────── */

export default function BlueprintRenderer({ blueprint }: BlueprintRendererProps) {
  const accent = blueprint.styleHints?.accentColor;

  const gap =
    blueprint.styleHints?.density === "compact"
      ? "gap-4"
      : blueprint.styleHints?.density === "spacious"
        ? "gap-10"
        : "gap-6";

  return (
    <div className={`flex flex-col ${gap} w-full`}>
      {blueprint.sections.map((section) => (
        <RenderSection key={section.id} section={section} globalAccent={accent} />
      ))}
    </div>
  );
}
