/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Chat Interface (Tambo-first)
 *
 * Uses @tambo-ai/react to generate a ForgeBlueprint component.
 * ForgeBlueprint then normalizes + dispatches the blueprint into Forge state.
 * ════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Send, Loader2, Hammer } from "lucide-react";
import { useTamboGenerationStage, useTamboThread, useTamboThreadInput } from "@tambo-ai/react";
import { useForge } from "../lib/forgeState";
import { matchDemoBlueprint } from "../lib/exampleBlueprints";
import { generateBlueprintWithGroq, hasGroq } from "../lib/groqClient";
import { normalizeBlueprint } from "../lib/normalizeBlueprint";

function errToMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function contentToText(content: unknown): string {
  if (content === null || content === undefined) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    // Tambo content parts (ChatCompletionContentPart[])
    const parts = content
      .map((p) => {
        if (typeof p === "string") return p;
        if (p && typeof p === "object") {
          const obj = p as Record<string, unknown>;
          if (obj.type === "text" && typeof obj.text === "string") return obj.text;
          if (typeof obj.text === "string") return obj.text;
        }
        return "";
      })
      .filter(Boolean);
    return parts.join("");
  }
  if (typeof content === "object") {
    const obj = content as Record<string, unknown>;
    if (typeof obj.text === "string") return obj.text;
    try {
      return JSON.stringify(content);
    } catch {
      return "";
    }
  }
  return String(content);
}

const SUGGESTED_PROMPTS = [
  "Build me a social media app",
  "A habit tracking app",
  "A SaaS landing page with pricing",
  "A personal finance tracker",
  "Add user profiles",
];

export default function TamboChatInterface() {
  const { thread } = useTamboThread();
  const { isIdle, generationStatusMessage } = useTamboGenerationStage();
  const { value, setValue, submit } = useTamboThreadInput();
  const { dispatch, activeBlueprint } = useForge();

  const [autoSubmitNonce, setAutoSubmitNonce] = useState(0);
  const pendingAutoSubmitRef = useRef<string | null>(null);
  const isSubmittingRef = useRef(false);
  const lastPromptRef = useRef<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allMessages = useMemo(() => thread?.messages ?? [], [thread?.messages]);
  const messages = useMemo(
    () => allMessages.filter((m) => m.role !== "system"),
    [allMessages],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const showWelcome = messages.length === 0;
  const isGenerating = !isIdle;

  async function runFallback(prompt: string) {
    setUsedFallback(false);

    const demoBlueprint = matchDemoBlueprint(prompt);
    if (demoBlueprint) {
      const { blueprint, warnings, rawInput } = normalizeBlueprint(
        demoBlueprint as unknown as Record<string, unknown>,
      );
      dispatch({
        type: "PUSH_BLUEPRINT",
        blueprint,
        prompt: "Fallback (Demo)",
        rawInput,
        normalizationWarnings: warnings,
      });
      setUsedFallback(true);
      return;
    }

    if (hasGroq) {
      try {
        const existingJson = activeBlueprint ? JSON.stringify(activeBlueprint) : undefined;
        const generated = await generateBlueprintWithGroq(prompt, existingJson);
        if (generated && generated.appType && generated.sections) {
          const { blueprint, warnings, rawInput } = normalizeBlueprint(generated);
          dispatch({
            type: "PUSH_BLUEPRINT",
            blueprint,
            prompt: "Fallback (Groq)",
            rawInput,
            normalizationWarnings: warnings,
          });
          setUsedFallback(true);
        }
      } catch (err) {
        console.warn("[Forge/Fallback] Groq fallback failed:", err);
      }
    }
  }

  // Ensure we submit using the *latest* submit() function, which closes over
  // the latest provider inputValue. Calling setValue()+submit() in the same
  // tick can submit the previous/empty value.
  useEffect(() => {
    const pending = pendingAutoSubmitRef.current;
    if (!pending) return;
    if (value.trim() !== pending.trim()) return;
    if (isSubmittingRef.current) return;

    pendingAutoSubmitRef.current = null;
    isSubmittingRef.current = true;
    lastPromptRef.current = pending;
    setSubmitError(null);
    setUsedFallback(false);

    (async () => {
      try {
        await submit({
          streamResponse: true,
          forceToolChoice: "ForgeBlueprint",
        });
        return;
      } catch (err1) {
        console.warn("[Forge/Tambo] submit failed (forced tool):", err1);

        // Retry once without forceToolChoice in case the backend doesn't
        // accept forcing a tool/component by name.
        try {
          await submit({ streamResponse: true });
          return;
        } catch (err2) {
          console.warn("[Forge/Tambo] submit failed (retry):", err2);
          setSubmitError(errToMessage(err2));
          await runFallback(pending);
        }
      } finally {
        isSubmittingRef.current = false;
      }
    })().catch((err) => {
      console.warn("[Forge/Tambo] unexpected submit error:", err);
      setSubmitError(errToMessage(err));
      isSubmittingRef.current = false;
    });
  }, [autoSubmitNonce, submit, value]);

  async function handleSubmit(prompt: string) {
    pendingAutoSubmitRef.current = prompt;
    setSubmitError(null);
    setUsedFallback(false);
    setValue(prompt);
    // Nudge a re-render so the effect runs even if Tambo trims/normalizes.
    setAutoSubmitNonce((n) => n + 1);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isGenerating) return;
    handleSubmit(trimmed);
  }

  function handleSuggestionClick(prompt: string) {
    if (isGenerating) return;
    handleSubmit(prompt);
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Messages area ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {submitError && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            <div className="font-semibold">Tambo error</div>
            <div className="text-amber-200/80 break-words">{submitError}</div>
            {usedFallback && (
              <div className="mt-1 text-amber-200/80">
                Preview updated using fallback generation.
              </div>
            )}
          </div>
        )}

        {showWelcome && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4">
              <Hammer size={28} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Welcome to Forge</h2>
            <p className="text-sm text-gray-400 max-w-sm mb-6">
              Describe a product idea and I’ll build a live, interactive UI for you — powered by Tambo.
            </p>

            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSuggestionClick(prompt)}
                  className="px-3 py-1.5 text-xs rounded-full border border-gray-700 text-gray-300 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const text = contentToText(msg.content);
          const isUser = msg.role === "user";
          const bubbleText =
            text ||
            (msg.role === "assistant"
              ? "Generated UI blueprint. Check the Preview tab."
              : "");

          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                  isUser
                    ? "bg-emerald-500/20 text-emerald-100 rounded-br-sm"
                    : "bg-gray-800/80 text-gray-300 rounded-bl-sm border border-gray-700/40"
                }`}
              >
                {bubbleText}
                {/*
                  IMPORTANT: Tambo attaches the generated UI as `renderedComponent`.
                  We mount it (hidden) so ForgeBlueprint can dispatch into app state.
                */}
                {msg.renderedComponent ? (
                  <div className="hidden">{msg.renderedComponent}</div>
                ) : null}
              </div>
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-gray-800/80 rounded-xl rounded-bl-sm border border-gray-700/40 px-4 py-2.5 flex items-center gap-2 text-sm text-gray-400">
              <Loader2 size={14} className="animate-spin" />
              {generationStatusMessage || "Building your app…"}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input area ─────────────────────────────────────────────── */}
      <form onSubmit={onSubmit} className="p-3 border-t border-gray-700/50">
        <div className="flex items-center gap-2 bg-gray-800/80 rounded-xl border border-gray-700/50 focus-within:border-emerald-500/50 px-3 py-2 transition-colors">
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Describe your product idea…"
            disabled={isGenerating}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!value.trim() || isGenerating}
            className="p-1.5 rounded-lg bg-emerald-500 text-white disabled:opacity-30 hover:bg-emerald-400 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
