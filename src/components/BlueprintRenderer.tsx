/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Blueprint Renderer
 *
 * Takes a UIBlueprint and renders it as a live React tree by:
 *   1. Iterating over blueprint.sections in order
 *   2. Resolving each component name against the registry
 *   3. Validating props via the Zod schema (silent fallback on error)
 *   4. Rendering the React component with validated props
 *
 * This is the bridge between "AI output" and "user-visible UI".
 * ════════════════════════════════════════════════════════════════════════
 */

import React, { createElement } from "react";
import type { UIBlueprint, BlueprintSection, BlueprintComponent } from "../types/blueprint";
import { getRegistryEntry } from "../registry";

/* ── Props ─────────────────────────────────────────────────────────── */

export interface BlueprintRendererProps {
  blueprint: UIBlueprint;
}

/* ── Error boundary for individual components ──────────────────────── */

class ComponentErrorBoundary extends React.Component<
  { name: string; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          ⚠ Component <span className="font-mono">{this.props.name}</span> failed to render.
        </div>
      );
    }
    return this.props.children;
  }
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
    return (
      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-300">
        Unknown component: <span className="font-mono">{entry.componentName}</span>
      </div>
    );
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

  // Density → vertical gap
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
