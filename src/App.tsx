/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Root App Component
 *
 * AI generation powered primarily by Tambo (hackathon requirement),
 * with Groq as a fallback when Tambo is not configured.
 * ════════════════════════════════════════════════════════════════════════
 */

import { ForgeProvider } from "./lib/forgeState";
import ForgeApp from "./components/ForgeApp";
import { TamboProvider, currentPageContextHelper, currentTimeContextHelper } from "@tambo-ai/react";
import { forgeTamboComponents, forgeTamboTools, FORGE_SYSTEM_CONTEXT } from "./lib/tambo";
import { hasTambo, TAMBO_API_KEY } from "./lib/tamboClient";

export default function App() {
  return (
    <ForgeProvider>
      {hasTambo ? (
        <TamboProvider
          apiKey={TAMBO_API_KEY!}
          tamboUrl="https://api.tambo.co"
          components={forgeTamboComponents}
          tools={forgeTamboTools}
          streaming
          initialMessages={[
            {
              role: "system",
              content: [{ type: "text", text: FORGE_SYSTEM_CONTEXT }],
            },
          ]}
          contextHelpers={{
            currentTime: currentTimeContextHelper,
            currentPage: currentPageContextHelper,
          }}
        >
          <ForgeApp />
        </TamboProvider>
      ) : (
        <ForgeApp />
      )}
    </ForgeProvider>
  );
}
