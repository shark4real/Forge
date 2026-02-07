# Forge — AI Product Builder

> Describe a product. Get a live React app. Powered by [Tambo](https://tambo.co) generative UI.

Forge is an **AI Product Builder** where users describe a product idea in natural language and the AI assembles a live, interactive React application using a **UI Blueprint** schema and a predefined **component registry**.

**This is not a code generator.** The AI output is *UI composition* — structured JSON that drives real component rendering.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Forge App                          │
├──────────┬──────────────────────┬───────────────────────┤
│  Chat    │   Preview Canvas     │  Explainability Panel │
│  Panel   │                      │  (toggle)             │
│          │  ┌────────────────┐  │                       │
│  User    │  │ Blueprint      │  │  • AI reasoning       │
│  types   │  │ Renderer       │  │  • Component choices  │
│  prompt  │  │                │  │  • Suggestions        │
│    │     │  │  sections[] →  │  │                       │
│    ▼     │  │  registry      │  │                       │
│  AI      │  │  lookup →      │  │                       │
│  returns │  │  React render  │  │                       │
│  UI      │  └────────────────┘  │                       │
│  Blue-   │                      │                       │
│  print   │                      │                       │
└──────────┴──────────────────────┴───────────────────────┘
```

### Rendering Flow

1. **User submits** a product idea in the chat panel
2. **AI produces** a `UIBlueprint` JSON (via Tambo or demo fallback)
3. **BlueprintRenderer** resolves each component from the registry
4. **Live app** appears in the preview canvas
5. **User refines** → AI returns updated blueprint → UI updates in-place

---

## Component Registry

Every component is **presentational only** — accepts props, contains zero business logic.

| Component | Purpose |
|---|---|
| `AppShell` | Top-level frame with optional sidebar |
| `NavigationBar` | Horizontal top navigation |
| `HeroSection` | Large hero banner with CTAs |
| `FeatureGrid` | Grid of feature cards |
| `PricingTable` | Side-by-side pricing tiers |
| `FormBuilder` | Dynamic form from field definitions |
| `DataTable` | Tabular data display |
| `CardList` | Vertical/horizontal/grid card list |
| `ChartView` | SVG bar, line, and pie charts |
| `SettingsPanel` | Toggle/text/select settings |
| `EmptyState` | Friendly empty placeholder |
| `StatsRow` | KPI metric cards with trends |
| `UserProfile` | Avatar + name + bio card |
| `Sidebar` | Vertical navigation panel |
| `Footer` | Site footer with link columns |

---

## UI Blueprint Schema

The AI must output structured JSON conforming to:

```typescript
interface UIBlueprint {
  appType: string;                    // "dashboard" | "landing-page" | "tracker" | ...
  layout: "single-page" | "sidebar-detail" | "multi-section" | "dashboard";
  sections: BlueprintSection[];       // Ordered component placements
  state?: MockStateField[];           // Mock data shape
  interactions?: InteractionHint[];   // Behavioural hints
  styleHints?: StyleHints;            // Global visual tweaks
  explanation?: BlueprintExplanation; // AI reasoning + suggestions
}
```

This schema is the **single source of truth** for rendering.

---

## Demo Prompts

These prompts produce fully-rendered apps out of the box:

| Prompt | Result |
|---|---|
| "A habit tracking app" | Sidebar layout + stats + habit cards + weekly chart |
| "A SaaS landing page with pricing" | Nav → Hero → Features → Pricing → Footer |
| "A personal finance tracker" | Dashboard + KPIs + pie chart + transaction table + trend line |
| "Make it mobile friendly" | Compact density, sidebar removed, single-page layout |
| "Add user profiles" | Appends UserProfile card + SettingsPanel to existing app |

---

## Getting Started

```bash
cd forge
npm install
npm run dev
```

### With Tambo Cloud (full AI mode)

1. Get an API key at [tambo.co/dashboard](https://tambo.co/dashboard)
2. Set it in `.env`:
   ```
   VITE_TAMBO_API_KEY=your_key_here
   ```
3. Restart the dev server

### Demo Mode (no API key needed)

The app works immediately with pre-baked example blueprints. No API key required for the demo prompts.

---

## Folder Structure

```
forge/
├── public/
│   └── forge-icon.svg
├── src/
│   ├── components/             # App-level UI components
│   │   ├── BlueprintRenderer.tsx   # Blueprint → React tree
│   │   ├── ChatInterface.tsx       # Conversation panel
│   │   ├── ExplainabilityPanel.tsx # "How it was built" panel
│   │   ├── ForgeApp.tsx            # Main 3-column shell
│   │   └── PreviewCanvas.tsx       # Device-frame preview
│   ├── registry/               # Component registry
│   │   ├── index.ts                # Registry + Zod schemas
│   │   └── components/            # 15 presentational components
│   │       ├── AppShell.tsx
│   │       ├── NavigationBar.tsx
│   │       ├── HeroSection.tsx
│   │       ├── FeatureGrid.tsx
│   │       ├── PricingTable.tsx
│   │       ├── FormBuilder.tsx
│   │       ├── DataTable.tsx
│   │       ├── CardList.tsx
│   │       ├── ChartView.tsx
│   │       ├── SettingsPanel.tsx
│   │       ├── EmptyState.tsx
│   │       ├── StatsRow.tsx
│   │       ├── UserProfile.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   ├── types/
│   │   └── blueprint.ts           # UIBlueprint TypeScript schema
│   ├── lib/
│   │   ├── tambo.ts               # Tambo SDK configuration
│   │   ├── forgeState.ts          # App state (Context + reducer)
│   │   └── exampleBlueprints.ts   # Pre-baked demo responses
│   ├── App.tsx                    # Root with conditional TamboProvider
│   ├── main.tsx                   # Entry point
│   ├── index.css                  # Tailwind + design tokens
│   └── vite-env.d.ts
├── .env                           # VITE_TAMBO_API_KEY
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Key Design Decisions

- **Blueprint-driven rendering**: The AI never outputs raw React code. It outputs a JSON blueprint that the renderer interprets against the registry.
- **Registry-constrained**: The AI can only use components from `componentRegistry`. This guarantees consistent, high-quality output.
- **Incremental refinement**: Each user message produces a new blueprint revision. Previous revisions are preserved and navigable.
- **Explainability built in**: Every blueprint includes reasoning, component rationale, and suggested improvements — visible via the "How it was built" panel.
- **Dual mode**: Works with Tambo Cloud for real AI, or with demo blueprints for instant offline demos.

---

## License

MIT
