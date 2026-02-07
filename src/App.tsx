/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Root App Component
 *
 * AI generation powered by Groq (Llama 3.3 70B) for reliable,
 * fast blueprint generation from any prompt.
 * Pre-baked demo blueprints available as instant examples.
 * ════════════════════════════════════════════════════════════════════════
 */

import { ForgeProvider } from "./lib/forgeState";
import ForgeApp from "./components/ForgeApp";

export default function App() {
  return (
    <ForgeProvider>
      <ForgeApp />
    </ForgeProvider>
  );
}
