/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — UI Blueprint Schema
 *
 * This is the **single source of truth** that sits between the AI and the
 * renderer.  The AI outputs JSON conforming to this schema; the renderer
 * consumes it to assemble a live React application.
 *
 * Every field has a clear purpose:
 *   • appType        — helps the AI choose layout strategy
 *   • layout         — top-level layout mode
 *   • sections       — ordered list of component placements
 *   • state          — mock data shape for realistic demos
 *   • interactions   — behavioural hints (not implemented, placeholder)
 *   • styleHints     — global visual tweaks
 *   • explanation    — AI reasoning & next steps (explainability)
 * ════════════════════════════════════════════════════════════════════════
 */

/* ── Section / component placement ─────────────────────────────────── */

export interface BlueprintComponent {
  /** Must match a name in the component registry */
  componentName: string;
  /** Props to pass — validated against the registry's Zod schema */
  props: Record<string, unknown>;
}

export interface BlueprintSection {
  /** Human-readable section ID, e.g. "hero", "pricing", "dashboard" */
  id: string;
  /** Optional heading rendered above the section */
  heading?: string;
  /** Ordered list of components in this section */
  components: BlueprintComponent[];
}

/* ── State shape hint ──────────────────────────────────────────────── */

export interface MockStateField {
  name: string;
  type: string;
  example: unknown;
}

/* ── Interactions hint ─────────────────────────────────────────────── */

export interface InteractionHint {
  trigger: string;
  action: string;
  description: string;
}

/* ── Style hints ───────────────────────────────────────────────────── */

export interface StyleHints {
  accentColor?: string;
  darkMode?: boolean;
  borderRadius?: "none" | "sm" | "md" | "lg" | "full";
  density?: "compact" | "normal" | "spacious";
}

/* ── Explanation block (explainability feature) ────────────────────── */

export interface BlueprintExplanation {
  /** Short summary of what the AI chose and why */
  reasoning: string;
  /** Per-component rationale — Record from demo/Groq, or array from Tambo */
  componentRationale:
    | Record<string, string>
    | Array<{ sectionId: string; rationale: string }>;
  /** Suggested next improvements the user could ask for */
  suggestedImprovements: string[];
}

/* ── Normalization diagnostics (crash-proofing) ───────────────────── */

export interface NormalizationWarning {
  type: "dropped-component" | "fixed-prop" | "default-applied" | "invalid-section";
  sectionId?: string;
  componentName?: string;
  detail: string;
}

/* ── The Blueprint itself ──────────────────────────────────────────── */

export interface UIBlueprint {
  /**
   * Semantic app type — informs layout decisions.
   * Examples: "dashboard", "landing-page", "tracker", "e-commerce", "form-app"
   */
  appType: string;

  /** Top-level layout mode */
  layout: "single-page" | "sidebar-detail" | "multi-section" | "dashboard";

  /** Ordered sections composing the app */
  sections: BlueprintSection[];

  /** Mock data shape so the demo looks realistic */
  state?: MockStateField[];

  /** Interaction behaviour hints (future use) */
  interactions?: InteractionHint[];

  /** Global visual tweaks */
  styleHints?: StyleHints;

  /** AI reasoning + explainability data */
  explanation?: BlueprintExplanation;
}

/* ── Blueprint versioning helper ───────────────────────────────────── */

export interface BlueprintSnapshot {
  /** Auto-incremented revision number */
  revision: number;
  /** ISO timestamp */
  createdAt: string;
  /** The user message that produced this revision */
  prompt: string;
  /** The blueprint itself */
  blueprint: UIBlueprint;

  /** Raw LLM input before normalization (for debugging) */
  rawInput?: Record<string, unknown>;

  /** Warnings produced by normalizeBlueprint() */
  normalizationWarnings?: NormalizationWarning[];
}
