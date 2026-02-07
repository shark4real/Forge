/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Root App Component
 *
 * Wiring strategy:
 *   • If VITE_TAMBO_API_KEY is present → wrap with TamboProvider so all
 *     AI flows through Tambo Cloud (generative UI mode).
 *   • Otherwise → run in DEMO MODE with pre-baked example blueprints
 *     + Groq AI generation for any prompt.
 *
 * Both modes share the same ForgeApp shell, chat interface, preview
 * canvas, and explainability panel.
 * ════════════════════════════════════════════════════════════════════════
 */

import { ForgeProvider } from "./lib/forgeState";
import ForgeApp from "./components/ForgeApp";
import { TamboProvider } from "@tambo-ai/react";
import {
  forgeTamboComponents,
  forgeTamboTools,
} from "./lib/tambo";

/* ── Optional Tambo integration ────────────────────────────────────── */

const TAMBO_API_KEY = import.meta.env.VITE_TAMBO_API_KEY as string | undefined;
const hasTambo = !!TAMBO_API_KEY && TAMBO_API_KEY !== "your_tambo_api_key_here";

/* ── Root ───────────────────────────────────────────────────────────── */

export default function App() {
  return (
    <ForgeProvider>
      {hasTambo ? (
        <TamboProvider
          apiKey={TAMBO_API_KEY!}
          components={forgeTamboComponents}
          tools={forgeTamboTools}
        >
          <ForgeApp tamboConnected />
        </TamboProvider>
      ) : (
        <ForgeApp tamboConnected={false} />
      )}
    </ForgeProvider>
  );
}
