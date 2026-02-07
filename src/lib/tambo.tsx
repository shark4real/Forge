/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Tambo Integration
 *
 * Wires the Blueprint schema into Tambo's generative UI pipeline:
 *   1. Defines a TamboComponent for the full UIBlueprint
 *   2. Provides the Tambo component + tool arrays for the provider
 *   3. Supplies the system prompt that constrains the AI's output
 *
 * The key insight: the AI doesn't output individual components.
 * It outputs a *complete UIBlueprint JSON* and Tambo streams it into
 * the <ForgeBlueprint /> wrapper, which delegates to BlueprintRenderer.
 * ════════════════════════════════════════════════════════════════════════
 */

import { z } from "zod";
import { useEffect, useRef } from "react";
import type { UIBlueprint } from "../types/blueprint";
import BlueprintRenderer from "../components/BlueprintRenderer";
import { componentRegistry } from "../registry";
import { useForge } from "./forgeState";
import { normalizeBlueprint } from "./normalizeBlueprint";

/** Pre-computed registry metadata for the tool (avoids dynamic require). */
const componentRegistryMeta = componentRegistry.map((entry) => ({
  name: entry.name,
  description: entry.description,
  propKeys: Object.keys(entry.propsSchema.shape),
}));

/* ── ForgeBlueprint wrapper ────────────────────────────────────────── */
/*
 * This React component is what Tambo actually renders into the message
 * stream.  Its props ARE the UIBlueprint schema.
 */

/**
 * ════════════════════════════════════════════════════════════════════════
 * CRITICAL ARCHITECTURAL BOUNDARY
 *
 * This component is the MANDATORY NORMALIZATION LAYER between Tambo (AI)
 * and React. It enforces the responsibility split:
 *
 *   Tambo's job:  Dynamically render AI-chosen components via registry
 *   OUR job:      Validate, sanitize, and normalize ALL AI output
 *
 * NEVER trust AI output. ALWAYS normalize before rendering.
 *
 * Pipeline: User → Tambo AI → Raw JSON → THIS NORMALIZER → Safe Blueprint → React
 * ════════════════════════════════════════════════════════════════════════
 */
export function ForgeBlueprint(props: UIBlueprint) {
  const { dispatch } = useForge();
  const dispatched = useRef(false);

  // DEFENSIVE: Treat props as completely untrusted raw input from AI.
  // Even if Tambo validates, we re-validate here as our final safety layer.
  const rawInput = typeof props === "object" && props !== null ? props : {};

  const { blueprint, warnings, rawInput: normalizedRaw } = normalizeBlueprint(
    rawInput as unknown as Record<string, unknown>,
  );

  useEffect(() => {
    if (!dispatched.current && blueprint.appType && blueprint.sections?.length > 0) {
      dispatched.current = true;
      dispatch({
        type: "PUSH_BLUEPRINT",
        blueprint,
        prompt: "Tambo AI",
        rawInput: normalizedRaw,
        normalizationWarnings: warnings,
      });
    }
  }, [blueprint.appType, blueprint.sections?.length, dispatch, blueprint, normalizedRaw, warnings]);

  // DEFENSIVE: Always render normalized blueprint, never raw AI props
  return <BlueprintRenderer blueprint={blueprint} />;
}

/* ── Zod schema for the full Blueprint ─────────────────────────────── */

const blueprintComponentSchema = z.object({
  componentName: z
    .string()
    .describe(
      "Must match a registry name: AppShell, NavigationBar, HeroSection, FeatureGrid, PricingTable, FormBuilder, DataTable, CardList, ChartView, SettingsPanel, EmptyState, StatsRow, UserProfile, Sidebar, Footer",
    ),
  props: z
    .object({
      // AppShell
      appName: z.string().optional(),
      tagline: z.string().optional(),
      accentColor: z.string().optional(),
      showSidebar: z.boolean().optional(),
      sidebarItems: z.array(z.string()).optional(),
      // NavigationBar
      brand: z.string().optional(),
      links: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
      cta: z.object({ label: z.string(), href: z.string() }).optional(),
      // HeroSection
      headline: z.string().optional(),
      subheadline: z.string().optional(),
      ctaLabel: z.string().optional(),
      ctaHref: z.string().optional(),
      imageUrl: z.string().optional(),
      // FeatureGrid
      columns: z.number().optional(),
      features: z.array(z.object({ icon: z.string(), title: z.string(), description: z.string() })).optional(),
      // PricingTable
      plans: z.array(z.object({ name: z.string(), price: z.string(), period: z.string().optional(), features: z.array(z.string()), cta: z.string(), highlighted: z.boolean().optional() })).optional(),
      // FormBuilder
      title: z.string().optional(),
      fields: z.array(z.object({ name: z.string(), label: z.string(), type: z.string(), placeholder: z.string().optional(), required: z.boolean().optional(), options: z.array(z.string()).optional() })).optional(),
      submitLabel: z.string().optional(),
      // DataTable
      tableColumns: z.array(z.object({ key: z.string(), label: z.string(), sortable: z.boolean().optional() })).optional().describe("Use tableColumns instead of columns for DataTable"),
      rows: z.array(z.object({ id: z.string().optional(), name: z.string().optional(), value: z.string().optional(), status: z.string().optional(), date: z.string().optional(), amount: z.string().optional(), email: z.string().optional(), role: z.string().optional() }).passthrough()).optional(),
      // CardList
      cards: z.array(z.object({ title: z.string(), description: z.string(), imageUrl: z.string().optional(), badge: z.string().optional(), tags: z.array(z.string()).optional() })).optional(),
      // ChartView
      chartType: z.enum(["bar", "line", "pie", "area"]).optional(),
      data: z.object({ labels: z.array(z.string()), datasets: z.array(z.object({ label: z.string(), data: z.array(z.number()), color: z.string().optional() })) }).optional(),
      // StatsRow
      stats: z.array(z.object({ label: z.string(), value: z.string(), change: z.string().optional(), trend: z.enum(["up", "down", "neutral"]).optional() })).optional(),
      // UserProfile
      name: z.string().optional(),
      email: z.string().optional(),
      avatar: z.string().optional(),
      role: z.string().optional(),
      userStats: z.array(z.object({ label: z.string(), value: z.string() })).optional().describe("User profile stats"),
      // SettingsPanel
      sections: z.array(z.object({ title: z.string().optional(), settings: z.array(z.object({ key: z.string(), label: z.string(), type: z.enum(["toggle", "select", "text", "range"]), value: z.string().or(z.boolean()).or(z.number()).optional(), options: z.array(z.string()).optional() })).optional(), items: z.array(z.object({ label: z.string(), icon: z.string().optional(), href: z.string().optional(), active: z.boolean().optional(), badge: z.string().optional() })).optional() })).optional(),
      // Sidebar (brand reused from NavigationBar)
      // Footer
      copyright: z.string().optional(),
      // Generic
      heading: z.string().optional(),
      description: z.string().optional(),
      icon: z.string().optional(),
      message: z.string().optional(),
      actionLabel: z.string().optional(),
    })
    .passthrough()
    .describe("Props object matching the component's schema — use the keys relevant to the chosen componentName"),
});

const blueprintSectionSchema = z.object({
  id: z.string().describe("Unique section identifier, e.g. 'hero', 'features', 'pricing'"),
  heading: z.string().optional(),
  components: z.array(blueprintComponentSchema),
});

const explanationSchema = z.object({
  reasoning: z.string().describe("Short summary of AI reasoning for this blueprint"),
  componentRationale: z
    .array(
      z.object({
        sectionId: z.string().describe("The section id this rationale applies to"),
        rationale: z.string().describe("Why this component was chosen for this section"),
      }),
    )
    .describe("Per-section rationale for component choices"),
  suggestedImprovements: z.array(z.string()).describe("Next improvements the user could request"),
});

export const uiBlueprintSchema = z.object({
  appType: z
    .string()
    .describe("Semantic app type: dashboard, landing-page, tracker, e-commerce, form-app, etc."),
  layout: z
    .enum(["single-page", "sidebar-detail", "multi-section", "dashboard"])
    .describe("Top-level layout mode"),
  sections: z.array(blueprintSectionSchema).describe("Ordered sections composing the app"),
  state: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        example: z.any(),
      }),
    )
    .optional()
    .describe("Mock data shape for realistic demos"),
  interactions: z
    .array(
      z.object({
        trigger: z.string(),
        action: z.string(),
        description: z.string(),
      }),
    )
    .optional(),
  styleHints: z
    .object({
      accentColor: z.string().optional(),
      darkMode: z.boolean().optional(),
      borderRadius: z.enum(["none", "sm", "md", "lg", "full"]).optional(),
      density: z.enum(["compact", "normal", "spacious"]).optional(),
    })
    .optional(),
  explanation: explanationSchema.optional(),
});

/* ── Tambo component list ──────────────────────────────────────────── */

export const forgeTamboComponents = [
  {
    name: "ForgeBlueprint",
    description: `
Forge UI Blueprint — the ONLY component you should render.

You are Forge, an AI product builder. When the user describes a product idea,
you MUST respond by rendering this component with a complete UIBlueprint as props.

AVAILABLE REGISTRY COMPONENTS (use these inside sections[].components[]):
  AppShell, NavigationBar, HeroSection, FeatureGrid, PricingTable,
  FormBuilder, DataTable, CardList, ChartView, SettingsPanel, EmptyState,
  StatsRow, UserProfile, Sidebar, Footer

RULES:
1. ALWAYS output a ForgeBlueprint — never respond with only text.
2. Choose components from the registry that best fit the product type.
3. Include realistic mock data so the UI looks like a real demo.
4. When the user refines ("make it mobile friendly", "add pricing"), merge
   changes into the EXISTING blueprint — preserve prior sections unless
   the user explicitly removes them.
5. Increase complexity gradually — start simple, add depth on refinement.
6. ALWAYS include the explanation field with reasoning, componentRationale,
   and suggestedImprovements.
7. Use appropriate layout: landing pages → multi-section, dashboards →
   dashboard, trackers → sidebar-detail, forms → single-page.
    `.trim(),
    component: ForgeBlueprint,
    propsSchema: uiBlueprintSchema,
  },
];

/* ── Tambo tools (AI helper utilities) ─────────────────────────────── */

export const forgeTamboTools = [
  {
    name: "get-component-registry",
    description:
      "Returns the list of available UI components with names, descriptions, and prop schemas. " +
      "Call this when you need to decide which components to use.",
    tool: () => {
      // Import from the registry — the component list is static
      return componentRegistryMeta;
    },
    inputSchema: z.object({}),
    outputSchema: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        propKeys: z.array(z.string()),
      }),
    ),
  },
];

/* ── System prompt — additional context for the AI ─────────────────── */

export const FORGE_SYSTEM_CONTEXT = `
You are **Forge**, an AI Product Builder.

The user describes a product idea in natural language. You MUST respond by
rendering the ForgeBlueprint component with a full UIBlueprint JSON as props.

NEVER respond with only text. ALWAYS render the ForgeBlueprint component.

Your job is UI COMPOSITION — pick the right components from the registry,
populate them with realistic mock data, and structure the layout intelligently.

KEY PRINCIPLES:
• Preserve earlier decisions unless the user explicitly changes them.
• Increase complexity gradually across conversation turns.
• Adapt layout strategy to the product type (dashboard vs. landing page, etc.).
• Keep everything demo-ready — realistic fake names, numbers, labels.
• The explanation field powers the "How this app was built" panel — always fill it.

DEMO SCENARIOS YOU MUST HANDLE WELL:
• "A habit tracking app" → sidebar-detail + StatsRow + CardList + ChartView
• "A SaaS landing page with pricing" → multi-section + NavBar + Hero + Features + Pricing + Footer
• "A personal finance tracker" → dashboard + StatsRow + ChartView + DataTable
• "Make it mobile friendly" → adjust density, simplify columns, keep components
• "Add user profiles" → add UserProfile component to existing blueprint
`.trim();
