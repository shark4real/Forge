/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Blueprint Normalizer
 *
 * Mandatory bridge between raw LLM JSON and the React render tree.
 *
 * NEVER render raw AI output directly. Always run through:
 *   normalizeBlueprint(rawLLMOutput) → safe UIBlueprint
 *
 * This module:
 *   1. Validates component names against the registry
 *   2. Drops unknown components silently (logged as warnings)
 *   3. Ensures all props are render-safe (strings, numbers, booleans, arrays)
 *   4. Converts object-shaped props (e.g. {label,href}) into flat strings
 *   5. Applies default values when props are missing or malformed
 *   6. NEVER throws — always returns a valid blueprint
 * ════════════════════════════════════════════════════════════════════════
 */

import type { UIBlueprint, BlueprintSection, BlueprintComponent, NormalizationWarning } from "../types/blueprint";
import { registryMap } from "../registry";

/* ── Normalization log ─────────────────────────────────────────────── */

export interface NormalizationResult {
  blueprint: UIBlueprint;
  warnings: NormalizationWarning[];
  rawInput: Record<string, unknown>;
}

/* ── Helpers ────────────────────────────────────────────────────────── */

/** Safely convert any value to a render-safe string */
function toSafeString(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    // {label: "foo", href: "/bar"} → "foo"
    const obj = val as Record<string, unknown>;
    if ("label" in obj && typeof obj.label === "string") return obj.label;
    if ("title" in obj && typeof obj.title === "string") return obj.title;
    if ("name" in obj && typeof obj.name === "string") return obj.name;
    if ("text" in obj && typeof obj.text === "string") return obj.text;
    try { return JSON.stringify(val); } catch { return "[object]"; }
  }
  return String(val);
}

/** Safely convert an array of potentially-objects into string[] */
function toStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val.map(toSafeString);
}

/** Ensure value is a usable array, coerce if needed */
function ensureArray(val: unknown): unknown[] {
  if (Array.isArray(val)) return val;
  if (val === null || val === undefined) return [];
  return [val];
}

/** Deep-sanitize an object so no nested value can crash React */
function sanitizeValue(val: unknown): unknown {
  if (val === null || val === undefined) return val;
  if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") return val;
  if (Array.isArray(val)) return val.map(sanitizeValue);
  if (typeof val === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      out[k] = sanitizeValue(v);
    }
    return out;
  }
  return String(val);
}

/* ── Per-component prop normalizers ────────────────────────────────── */

type PropNormalizer = (props: Record<string, unknown>, warnings: NormalizationWarning[], sectionId: string) => Record<string, unknown>;

const propNormalizers: Record<string, PropNormalizer> = {

  NavigationBar(props, warnings, sectionId) {
    // links: expect string[], LLM may send [{label,href}]
    const raw = props.links ?? props.items ?? props.navItems ?? [];
    props.links = toStringArray(raw);
    if (!props.brand || typeof props.brand !== "string") {
      props.brand = toSafeString(props.brand) || "App";
    }
    // ctaLabel can come as {label,href} object
    if (props.ctaLabel && typeof props.ctaLabel === "object") {
      const obj = props.ctaLabel as Record<string, unknown>;
      props.ctaLabel = toSafeString(obj.label ?? obj);
    }
    // LLM sometimes sends cta: {label, href}
    if (props.cta && typeof props.cta === "object" && !props.ctaLabel) {
      const cta = props.cta as Record<string, unknown>;
      props.ctaLabel = toSafeString(cta.label ?? cta);
      delete props.cta;
    }
    return props;
  },

  HeroSection(props, _w, _s) {
    if (props.headline && typeof props.headline !== "string") props.headline = toSafeString(props.headline);
    if (props.subheading && typeof props.subheading !== "string") props.subheading = toSafeString(props.subheading);
    if (!props.headline) props.headline = props.title ?? props.heading ?? "Welcome";
    // LLM may send subheadline instead of subheading
    if (!props.subheading && props.subheadline) { props.subheading = toSafeString(props.subheadline); delete props.subheadline; }
    // LLM may send ctaLabel instead of primaryCta
    if (!props.primaryCta && props.ctaLabel) { props.primaryCta = toSafeString(props.ctaLabel); delete props.ctaLabel; }
    if (!props.primaryCta && props.ctaHref) { props.primaryCta = "Get Started"; }
    return props;
  },

  FeatureGrid(props, warnings, sectionId) {
    const rawFeatures = ensureArray(props.features);
    props.features = rawFeatures.map((f: unknown) => {
      if (typeof f === "string") return { title: f, description: "" };
      if (typeof f === "object" && f !== null) {
        const obj = f as Record<string, unknown>;
        return {
          icon: toSafeString(obj.icon ?? ""),
          title: toSafeString(obj.title ?? obj.name ?? "Feature"),
          description: toSafeString(obj.description ?? obj.desc ?? ""),
        };
      }
      return { title: toSafeString(f), description: "" };
    });
    if (props.columns && typeof props.columns !== "number") {
      props.columns = parseInt(String(props.columns), 10) || 3;
    }
    return props;
  },

  PricingTable(props, warnings, sectionId) {
    // LLM may send "plans" instead of "tiers"
    const rawTiers = ensureArray(props.tiers ?? props.plans ?? []);
    props.tiers = rawTiers.map((t: unknown) => {
      if (typeof t !== "object" || t === null) return { name: "Plan", price: "$0", features: [] };
      const obj = t as Record<string, unknown>;
      return {
        name: toSafeString(obj.name ?? "Plan"),
        price: toSafeString(obj.price ?? "$0"),
        period: obj.period ? toSafeString(obj.period) : undefined,
        features: toStringArray(obj.features ?? []),
        highlighted: obj.highlighted === true,
        ctaLabel: obj.ctaLabel ? toSafeString(obj.ctaLabel) : obj.cta ? toSafeString(obj.cta) : undefined,
      };
    });
    delete props.plans;
    return props;
  },

  FormBuilder(props, _w, _s) {
    const rawFields = ensureArray(props.fields ?? []);
    props.fields = rawFields.map((f: unknown) => {
      if (typeof f !== "object" || f === null) return { name: "field", label: toSafeString(f), type: "text" };
      const obj = f as Record<string, unknown>;
      const validTypes = ["text", "email", "number", "textarea", "select", "checkbox"];
      const type = validTypes.includes(String(obj.type)) ? String(obj.type) : "text";
      return {
        name: toSafeString(obj.name ?? obj.label ?? "field"),
        label: toSafeString(obj.label ?? obj.name ?? "Field"),
        type,
        placeholder: obj.placeholder ? toSafeString(obj.placeholder) : undefined,
        options: obj.options ? toStringArray(obj.options) : undefined,
        required: obj.required === true,
      };
    });
    if (props.submitLabel && typeof props.submitLabel !== "string") props.submitLabel = toSafeString(props.submitLabel);
    return props;
  },

  DataTable(props, _w, _s) {
    // LLM may send columns as [{key,label}] instead of string[]
    const rawCols = ensureArray(props.columns ?? []);
    props.columns = rawCols.map((c: unknown) => {
      if (typeof c === "string") return c;
      if (typeof c === "object" && c !== null) {
        const obj = c as Record<string, unknown>;
        return toSafeString(obj.label ?? obj.key ?? obj.name ?? obj);
      }
      return toSafeString(c);
    });
    // Rows: ensure each row value is a string or number
    const rawRows = ensureArray(props.rows ?? props.data ?? []);
    props.rows = rawRows.map((r: unknown) => {
      if (typeof r !== "object" || r === null) return {};
      const obj = r as Record<string, unknown>;
      const clean: Record<string, string | number> = {};
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === "number") clean[k] = v;
        else clean[k] = toSafeString(v);
      }
      return clean;
    });
    delete props.data;
    return props;
  },

  CardList(props, _w, _s) {
    const rawCards = ensureArray(props.cards ?? props.items ?? []);
    props.cards = rawCards.map((c: unknown) => {
      if (typeof c === "string") return { title: c };
      if (typeof c !== "object" || c === null) return { title: toSafeString(c) };
      const obj = c as Record<string, unknown>;
      return {
        title: toSafeString(obj.title ?? obj.name ?? "Card"),
        description: obj.description ? toSafeString(obj.description) : undefined,
        badge: obj.badge ? toSafeString(obj.badge) : undefined,
        imageUrl: obj.imageUrl ? toSafeString(obj.imageUrl) : undefined,
        metadata: obj.metadata ? toSafeString(obj.metadata) : undefined,
        // LLM may include tags array
        ...(obj.tags ? { metadata: toStringArray(obj.tags).join(", ") } : {}),
      };
    });
    delete props.items;
    // layout validation
    const validLayouts = ["vertical", "horizontal", "grid"];
    if (props.layout && !validLayouts.includes(String(props.layout))) {
      props.layout = "vertical";
    }
    return props;
  },

  ChartView(props, _w, _s) {
    const rawData = ensureArray(props.data ?? []);
    props.data = rawData.map((d: unknown) => {
      if (typeof d !== "object" || d === null) return { label: toSafeString(d), value: 0 };
      const obj = d as Record<string, unknown>;
      return {
        label: toSafeString(obj.label ?? obj.name ?? ""),
        value: typeof obj.value === "number" ? obj.value : parseFloat(String(obj.value)) || 0,
      };
    });
    // LLM may send chartType instead of type
    if (props.chartType && !props.type) { props.type = props.chartType; delete props.chartType; }
    const validTypes = ["bar", "line", "pie"];
    if (props.type && !validTypes.includes(String(props.type))) props.type = "bar";
    // LLM may send datasets format: {labels, datasets}
    if (!Array.isArray(props.data) || props.data.length === 0) {
      if (props.labels && props.datasets) {
        const labels = toStringArray(props.labels);
        const ds = ensureArray(props.datasets);
        if (ds.length > 0) {
          const first = ds[0] as Record<string, unknown>;
          const values = ensureArray(first.data ?? []);
          props.data = labels.map((label, i) => ({
            label,
            value: typeof values[i] === "number" ? values[i] : parseFloat(String(values[i])) || 0,
          }));
        }
        delete props.labels;
        delete props.datasets;
      }
    }
    return props;
  },

  SettingsPanel(props, _w, _s) {
    // LLM may send sections: [{title, settings:[...]}] instead of flat settings[]
    if (props.sections && !props.settings) {
      const secs = ensureArray(props.sections);
      const flat: unknown[] = [];
      for (const sec of secs) {
        if (typeof sec === "object" && sec !== null) {
          const obj = sec as Record<string, unknown>;
          const items = ensureArray(obj.settings ?? obj.items ?? []);
          flat.push(...items);
        }
      }
      if (flat.length > 0) {
        props.settings = flat;
        delete props.sections;
      }
    }
    const rawSettings = ensureArray(props.settings ?? []);
    props.settings = rawSettings.map((s: unknown) => {
      if (typeof s !== "object" || s === null) return { label: toSafeString(s), type: "text" };
      const obj = s as Record<string, unknown>;
      const validTypes = ["toggle", "text", "select"];
      const type = validTypes.includes(String(obj.type)) ? String(obj.type) : "text";
      let value = obj.value;
      if (typeof value === "object" && value !== null) value = toSafeString(value);
      return {
        label: toSafeString(obj.label ?? obj.key ?? "Setting"),
        description: obj.description ? toSafeString(obj.description) : undefined,
        type,
        value: value !== undefined ? (typeof value === "boolean" ? value : toSafeString(value)) : undefined,
        options: obj.options ? toStringArray(obj.options) : undefined,
      };
    });
    return props;
  },

  StatsRow(props, _w, _s) {
    const rawStats = ensureArray(props.stats ?? []);
    props.stats = rawStats.map((s: unknown) => {
      if (typeof s !== "object" || s === null) return { label: toSafeString(s), value: "0" };
      const obj = s as Record<string, unknown>;
      const validTrends = ["up", "down", "neutral"];
      return {
        label: toSafeString(obj.label ?? obj.name ?? "Stat"),
        value: toSafeString(obj.value ?? "0"),
        change: obj.change ? toSafeString(obj.change) : undefined,
        trend: validTrends.includes(String(obj.trend)) ? String(obj.trend) : undefined,
      };
    });
    return props;
  },

  UserProfile(props, _w, _s) {
    if (!props.name || typeof props.name !== "string") props.name = toSafeString(props.name) || "User";
    if (props.email && typeof props.email !== "string") props.email = toSafeString(props.email);
    if (props.bio && typeof props.bio !== "string") props.bio = toSafeString(props.bio);
    if (props.role && typeof props.role !== "string") props.role = toSafeString(props.role);
    // LLM may send avatar instead of avatarUrl
    if (!props.avatarUrl && props.avatar) { props.avatarUrl = toSafeString(props.avatar); delete props.avatar; }
    // LLM may send stats array — convert to metadata string
    if (props.stats && Array.isArray(props.stats)) {
      const statsStr = (props.stats as Array<Record<string, unknown>>)
        .map(s => `${toSafeString(s.label)}: ${toSafeString(s.value)}`)
        .join(" · ");
      if (!props.bio) props.bio = statsStr;
      delete props.stats;
    }
    return props;
  },

  Sidebar(props, _w, _s) {
    const rawSections = ensureArray(props.sections ?? []);
    props.sections = rawSections.map((s: unknown) => {
      if (typeof s !== "object" || s === null) return { items: [toSafeString(s)] };
      const obj = s as Record<string, unknown>;
      return {
        heading: obj.heading ? toSafeString(obj.heading) : obj.title ? toSafeString(obj.title) : undefined,
        items: toStringArray(obj.items ?? obj.links ?? []),
      };
    });
    // LLM may send brand as an object
    if (props.brand && typeof props.brand !== "string") props.brand = toSafeString(props.brand);
    return props;
  },

  Footer(props, _w, _s) {
    // LLM may send columns: [{title, links: [{label,href}]}]
    const rawCols = ensureArray(props.columns ?? []);
    props.columns = rawCols.map((c: unknown) => {
      if (typeof c !== "object" || c === null) return { heading: toSafeString(c), links: [] };
      const obj = c as Record<string, unknown>;
      return {
        heading: toSafeString(obj.heading ?? obj.title ?? obj.name ?? "Links"),
        links: toStringArray(obj.links ?? obj.items ?? []),
      };
    });
    if (props.brand && typeof props.brand !== "string") props.brand = toSafeString(props.brand);
    if (props.copyright && typeof props.copyright !== "string") props.copyright = toSafeString(props.copyright);
    return props;
  },

  AppShell(props, _w, _s) {
    if (!props.appName || typeof props.appName !== "string") props.appName = toSafeString(props.appName) || "App";
    if (props.tagline && typeof props.tagline !== "string") props.tagline = toSafeString(props.tagline);
    if (props.sidebarItems) props.sidebarItems = toStringArray(props.sidebarItems);
    return props;
  },

  EmptyState(props, _w, _s) {
    if (!props.title || typeof props.title !== "string") props.title = toSafeString(props.title) || "Nothing here yet";
    if (props.description && typeof props.description !== "string") props.description = toSafeString(props.description);
    if (props.icon && typeof props.icon !== "string") props.icon = toSafeString(props.icon);
    return props;
  },
};

/* ── Normalize a single component ──────────────────────────────────── */

function normalizeComponent(
  comp: Record<string, unknown>,
  sectionId: string,
  warnings: NormalizationWarning[],
): BlueprintComponent | null {
  const name = String(comp.componentName ?? comp.component ?? comp.type ?? "");

  if (!name) {
    warnings.push({ type: "dropped-component", sectionId, componentName: "(empty)", detail: "Component has no name" });
    return null;
  }

  // Check registry
  if (!registryMap.has(name)) {
    warnings.push({ type: "dropped-component", sectionId, componentName: name, detail: `Unknown component "${name}" — not in registry` });
    return null;
  }

  // Get raw props
  let props: Record<string, unknown> = {};
  if (comp.props && typeof comp.props === "object" && !Array.isArray(comp.props)) {
    props = { ...(comp.props as Record<string, unknown>) };
  } else {
    // Some LLM outputs put props at the top level alongside componentName
    props = { ...comp };
    delete props.componentName;
    delete props.component;
    delete props.type;
  }

  // Apply per-component normalizer
  const normalizer = propNormalizers[name];
  if (normalizer) {
    try {
      props = normalizer(props, warnings, sectionId);
    } catch (err) {
      warnings.push({ type: "fixed-prop", sectionId, componentName: name, detail: `Normalizer error: ${err}` });
    }
  }

  // Final deep sanitize to ensure nothing crashes React
  props = sanitizeValue(props) as Record<string, unknown>;

  return { componentName: name, props };
}

/* ── Normalize a section ───────────────────────────────────────────── */

function normalizeSection(
  raw: Record<string, unknown>,
  idx: number,
  warnings: NormalizationWarning[],
): BlueprintSection | null {
  const id = String(raw.id ?? `section-${idx}`);
  const heading = raw.heading ? toSafeString(raw.heading) : undefined;
  const rawComps = ensureArray(raw.components ?? []);

  const components: BlueprintComponent[] = [];
  for (const rawComp of rawComps) {
    if (typeof rawComp !== "object" || rawComp === null) continue;
    const normalized = normalizeComponent(rawComp as Record<string, unknown>, id, warnings);
    if (normalized) components.push(normalized);
  }

  if (components.length === 0) {
    warnings.push({ type: "invalid-section", sectionId: id, detail: `Section "${id}" has no valid components — dropped` });
    return null;
  }

  return { id, heading, components };
}

/* ── Main normalizer ───────────────────────────────────────────────── */

export function normalizeBlueprint(raw: Record<string, unknown>): NormalizationResult {
  const warnings: NormalizationWarning[] = [];

  // Extract basic fields
  const appType = toSafeString(raw.appType ?? raw.app_type ?? raw.type ?? "app");
  const layoutOptions = ["single-page", "sidebar-detail", "multi-section", "dashboard"];
  const layout = layoutOptions.includes(String(raw.layout)) ? String(raw.layout) as UIBlueprint["layout"] : "single-page";

  // Normalize sections
  const rawSections = ensureArray(raw.sections ?? []);
  const sections: BlueprintSection[] = [];

  for (let i = 0; i < rawSections.length; i++) {
    const rawSec = rawSections[i];
    if (typeof rawSec !== "object" || rawSec === null) continue;
    const section = normalizeSection(rawSec as Record<string, unknown>, i, warnings);
    if (section) sections.push(section);
  }

  // If no valid sections at all, create a fallback
  if (sections.length === 0) {
    warnings.push({ type: "invalid-section", detail: "No valid sections found — adding fallback empty state" });
    sections.push({
      id: "fallback",
      heading: "Blueprint Generation",
      components: [{
        componentName: "EmptyState",
        props: {
          icon: "🔧",
          title: "Couldn't render this blueprint",
          description: "The AI generated a response, but no known components could be extracted. Try rephrasing your request.",
        },
      }],
    });
  }

  // Normalize explanation
  let explanation = raw.explanation as UIBlueprint["explanation"] | undefined;
  if (explanation && typeof explanation === "object") {
    const exp = explanation as unknown as Record<string, unknown>;
    explanation = {
      reasoning: toSafeString(exp.reasoning ?? ""),
      componentRationale: typeof exp.componentRationale === "object" && exp.componentRationale !== null
        ? (Array.isArray(exp.componentRationale)
          ? (exp.componentRationale as Array<Record<string, unknown>>).map(r => ({
            sectionId: toSafeString(r.sectionId ?? r.section ?? ""),
            rationale: toSafeString(r.rationale ?? r.reason ?? ""),
          }))
          : Object.fromEntries(
            Object.entries(exp.componentRationale as Record<string, unknown>).map(
              ([k, v]) => [k, toSafeString(v)]
            )
          ))
        : {},
      suggestedImprovements: toStringArray(exp.suggestedImprovements ?? exp.suggestions ?? []),
    };
  }

  const blueprint: UIBlueprint = {
    appType,
    layout,
    sections,
    explanation,
    styleHints: raw.styleHints ? sanitizeValue(raw.styleHints) as UIBlueprint["styleHints"] : undefined,
  };

  return { blueprint, warnings, rawInput: raw };
}
