/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Component Registry
 *
 * Central registry of every presentational component the AI can choose.
 * Each entry includes:
 *   • name         — unique identifier used in blueprints
 *   • description  — helps the AI pick the right component
 *   • component    — the React component reference
 *   • propsSchema  — Zod schema that doubles as Tambo's prop contract
 *
 * The registry is the ONLY source of truth for what the AI can render.
 * ════════════════════════════════════════════════════════════════════════
 */

import { z } from "zod";
import type { ComponentType } from "react";

/* ── Component imports ─────────────────────────────────────────────── */

import AppShell from "./components/AppShell";
import NavigationBar from "./components/NavigationBar";
import HeroSection from "./components/HeroSection";
import FeatureGrid from "./components/FeatureGrid";
import PricingTable from "./components/PricingTable";
import FormBuilder from "./components/FormBuilder";
import DataTable from "./components/DataTable";
import CardList from "./components/CardList";
import ChartView from "./components/ChartView";
import SettingsPanel from "./components/SettingsPanel";
import EmptyState from "./components/EmptyState";
import StatsRow from "./components/StatsRow";
import UserProfile from "./components/UserProfile";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

/* ── Registry entry type ───────────────────────────────────────────── */

export interface ForgeRegistryEntry {
  name: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  propsSchema: z.ZodObject<z.ZodRawShape>;
}

/* ── Schemas ───────────────────────────────────────────────────────── */

const appShellSchema = z.object({
  appName: z.string().describe("Name of the application"),
  tagline: z.string().optional().describe("Short tagline beneath the app name"),
  accentColor: z.string().optional().describe("CSS hex color for accent, e.g. #6366f1"),
  showSidebar: z.boolean().optional().describe("Whether to render a sidebar layout"),
  sidebarItems: z.array(z.string()).optional().describe("Labels for sidebar navigation items"),
});

const navigationBarSchema = z.object({
  brand: z.string().describe("Brand / logo text"),
  links: z.array(z.string()).describe("Top-level navigation link labels"),
  ctaLabel: z.string().optional().describe("Call-to-action button label"),
  accentColor: z.string().optional(),
});

const heroSectionSchema = z.object({
  headline: z.string().describe("Main hero headline"),
  subheading: z.string().optional().describe("Supporting text below the headline"),
  primaryCta: z.string().optional().describe("Primary call-to-action label"),
  secondaryCta: z.string().optional().describe("Secondary CTA label"),
  accentColor: z.string().optional(),
  backgroundStyle: z.enum(["gradient", "solid", "mesh"]).optional(),
});

const featureGridSchema = z.object({
  heading: z.string().optional(),
  features: z
    .array(
      z.object({
        icon: z.string().optional().describe("Emoji or symbol"),
        title: z.string(),
        description: z.string(),
      }),
    )
    .describe("Array of feature cards"),
  columns: z.number().optional().describe("Number of grid columns (2, 3, or 4)"),
  accentColor: z.string().optional(),
});

const pricingTableSchema = z.object({
  heading: z.string().optional(),
  tiers: z
    .array(
      z.object({
        name: z.string(),
        price: z.string().describe("Display price e.g. '$9' or 'Free'"),
        period: z.string().optional().describe("e.g. 'month', 'year'"),
        features: z.array(z.string()).describe("List of included features"),
        highlighted: z.boolean().optional().describe("Visually emphasize this tier"),
        ctaLabel: z.string().optional(),
      }),
    )
    .describe("Array of pricing tiers"),
  accentColor: z.string().optional(),
});

const formBuilderSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  fields: z
    .array(
      z.object({
        name: z.string(),
        label: z.string(),
        type: z.enum(["text", "email", "number", "textarea", "select", "checkbox"]),
        placeholder: z.string().optional(),
        options: z.array(z.string()).optional().describe("Options for select fields"),
        required: z.boolean().optional(),
      }),
    )
    .describe("Array of form field definitions"),
  submitLabel: z.string().optional(),
  accentColor: z.string().optional(),
});

const dataTableSchema = z.object({
  title: z.string().optional(),
  columns: z.array(z.string()).describe("Column header labels"),
  rows: z
    .array(z.record(z.string(), z.union([z.string(), z.number()])))
    .describe("Array of row objects keyed by column name"),
  accentColor: z.string().optional(),
});

const cardListSchema = z.object({
  heading: z.string().optional(),
  cards: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        badge: z.string().optional(),
        imageUrl: z.string().optional(),
        metadata: z.string().optional(),
      }),
    )
    .describe("Array of card items"),
  layout: z.enum(["vertical", "horizontal", "grid"]).optional(),
  accentColor: z.string().optional(),
});

const chartViewSchema = z.object({
  title: z.string().optional(),
  data: z
    .array(z.object({ label: z.string(), value: z.number() }))
    .describe("Data points to visualize"),
  type: z.enum(["bar", "line", "pie"]).optional(),
  accentColor: z.string().optional(),
});

const settingsPanelSchema = z.object({
  title: z.string().optional(),
  settings: z
    .array(
      z.object({
        label: z.string(),
        description: z.string().optional(),
        type: z.enum(["toggle", "text", "select"]),
        value: z.union([z.string(), z.boolean()]).optional(),
        options: z.array(z.string()).optional(),
      }),
    )
    .describe("Array of setting entries"),
  accentColor: z.string().optional(),
});

const emptyStateSchema = z.object({
  icon: z.string().optional().describe("Emoji icon"),
  title: z.string().describe("Empty state title"),
  description: z.string().optional(),
  ctaLabel: z.string().optional(),
  accentColor: z.string().optional(),
});

const statsRowSchema = z.object({
  stats: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        change: z.string().optional(),
        trend: z.enum(["up", "down", "neutral"]).optional(),
      }),
    )
    .describe("Array of KPI stat items"),
  accentColor: z.string().optional(),
});

const userProfileSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  avatarUrl: z.string().optional(),
  bio: z.string().optional(),
  role: z.string().optional(),
  accentColor: z.string().optional(),
});

const sidebarSchema = z.object({
  brand: z.string().optional(),
  sections: z
    .array(
      z.object({
        heading: z.string().optional(),
        items: z.array(z.string()),
      }),
    )
    .describe("Sidebar nav sections"),
  accentColor: z.string().optional(),
});

const footerSchema = z.object({
  brand: z.string().optional(),
  columns: z
    .array(
      z.object({
        heading: z.string(),
        links: z.array(z.string()),
      }),
    )
    .optional()
    .describe("Footer link columns"),
  copyright: z.string().optional(),
  accentColor: z.string().optional(),
});

/* ── The registry ──────────────────────────────────────────────────── */

export const componentRegistry: ForgeRegistryEntry[] = [
  {
    name: "AppShell",
    description:
      "Top-level application frame with optional sidebar, header, and content area. Use as the root layout wrapper.",
    component: AppShell,
    propsSchema: appShellSchema,
  },
  {
    name: "NavigationBar",
    description:
      "Horizontal navigation bar with brand text, links, and an optional CTA button. Best at the top of a page.",
    component: NavigationBar,
    propsSchema: navigationBarSchema,
  },
  {
    name: "HeroSection",
    description:
      "Large hero banner with headline, subtext, and CTA buttons. Ideal for landing pages and marketing sites.",
    component: HeroSection,
    propsSchema: heroSectionSchema,
  },
  {
    name: "FeatureGrid",
    description:
      "Grid of feature / benefit cards with icons, titles, and descriptions. Great for product feature showcases.",
    component: FeatureGrid,
    propsSchema: featureGridSchema,
  },
  {
    name: "PricingTable",
    description:
      "Side-by-side pricing tiers with feature lists and CTA buttons. Use for SaaS pricing pages.",
    component: PricingTable,
    propsSchema: pricingTableSchema,
  },
  {
    name: "FormBuilder",
    description:
      "Dynamic form rendered from a field definition array. Supports text, email, number, textarea, select, and checkbox fields.",
    component: FormBuilder,
    propsSchema: formBuilderSchema,
  },
  {
    name: "DataTable",
    description:
      "Tabular data display with column headers and row data. Ideal for dashboards and data-heavy views.",
    component: DataTable,
    propsSchema: dataTableSchema,
  },
  {
    name: "CardList",
    description:
      "List of content cards in vertical, horizontal, or grid layout. Good for lists of items, articles, or products.",
    component: CardList,
    propsSchema: cardListSchema,
  },
  {
    name: "ChartView",
    description:
      "Lightweight chart component supporting bar, line, and pie charts with SVG rendering. Use for data visualization.",
    component: ChartView,
    propsSchema: chartViewSchema,
  },
  {
    name: "SettingsPanel",
    description:
      "Settings / preferences panel with toggles, text inputs, and selects. Use for app configuration screens.",
    component: SettingsPanel,
    propsSchema: settingsPanelSchema,
  },
  {
    name: "EmptyState",
    description:
      "Friendly placeholder shown when a section has no data yet. Includes icon, message, and optional CTA.",
    component: EmptyState,
    propsSchema: emptyStateSchema,
  },
  {
    name: "StatsRow",
    description:
      "Horizontal row of KPI / metric cards with values and trend indicators. Perfect for dashboard headers.",
    component: StatsRow,
    propsSchema: statsRowSchema,
  },
  {
    name: "UserProfile",
    description:
      "User profile card with avatar, name, role, email, and bio. Use for profile pages or user lists.",
    component: UserProfile,
    propsSchema: userProfileSchema,
  },
  {
    name: "Sidebar",
    description:
      "Vertical navigation sidebar with grouped sections. Use alongside main content for app-style layouts.",
    component: Sidebar,
    propsSchema: sidebarSchema,
  },
  {
    name: "Footer",
    description:
      "Page footer with brand, link columns, and copyright. Use at the bottom of landing pages.",
    component: Footer,
    propsSchema: footerSchema,
  },
];

/* ── Lookup helpers ────────────────────────────────────────────────── */

/** Fast O(1) lookup by component name. */
export const registryMap = new Map(
  componentRegistry.map((entry) => [entry.name, entry]),
);

/** Get a component entry by name, or undefined. */
export function getRegistryEntry(name: string): ForgeRegistryEntry | undefined {
  return registryMap.get(name);
}
