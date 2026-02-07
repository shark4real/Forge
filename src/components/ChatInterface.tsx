/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Chat Interface
 *
 * Left-hand conversation panel.  In TAMBO MODE (with valid API key),
 * messages flow through Tambo's SDK. In DEMO MODE (no key), we use
 * the pre-baked example blueprints for instant results.
 *
 * This component integrates with Tambo via:
 *   • useTamboThread()       — thread & messages
 *   • useTamboThreadInput()  — input value & submit
 * ════════════════════════════════════════════════════════════════════════
 */

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Send, Loader2, Hammer } from "lucide-react";
import { useForge } from "../lib/forgeState";
import { matchDemoBlueprint } from "../lib/exampleBlueprints";
import { generateBlueprintWithGroq, hasGroq } from "../lib/groqClient";
import type { UIBlueprint } from "../types/blueprint";

/* ── Message type (local, for demo mode) ───────────────────────────── */

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  blueprint?: UIBlueprint;
}

/* ── Demo prompts ──────────────────────────────────────────────────── */

const DEMO_PROMPTS = [
  "A habit tracking app",
  "A SaaS landing page with pricing",
  "A personal finance tracker",
  "Make it mobile friendly",
  "Add user profiles",
];

/* ── Component ─────────────────────────────────────────────────────── */

interface ChatInterfaceProps {
  /** Whether Tambo cloud is connected */
  tamboConnected: boolean;
  /** Thread messages from Tambo (when connected) */
  tamboMessages?: Array<{
    id: string;
    role: string;
    content: unknown;
    renderedComponent?: React.ReactNode;
  }>;
  /** Submit handler from Tambo (when connected) */
  tamboSubmit?: (value: string) => void;
  tamboIsPending?: boolean;
}

export default function ChatInterface({
  tamboConnected,
  tamboMessages,
  tamboSubmit,
  tamboIsPending,
}: ChatInterfaceProps) {
  const { dispatch, history, activeIndex, activeBlueprint } = useForge();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPending = tamboConnected ? tamboIsPending : isGenerating;

  /* Auto-scroll to bottom */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tamboMessages]);

  /* ── Demo-mode submit ────────────────────────────────────────────── */

  async function handleDemoSubmit(prompt: string) {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: prompt,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    // First try pre-baked demo blueprints
    const demoBlueprint = matchDemoBlueprint(prompt);

    if (demoBlueprint) {
      // Small delay for feel
      await new Promise((r) => setTimeout(r, 600));
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: `Here's your ${demoBlueprint.appType} app! I've assembled ${demoBlueprint.sections.length} sections using components from the registry.`,
        blueprint: demoBlueprint,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      dispatch({ type: "PUSH_BLUEPRINT", blueprint: demoBlueprint, prompt });
      setIsGenerating(false);
      return;
    }

    // If no demo match, try Groq AI generation
    if (hasGroq) {
      try {
        const existingJson = activeBlueprint
          ? JSON.stringify(activeBlueprint)
          : undefined;
        const generated = await generateBlueprintWithGroq(prompt, existingJson);

        if (generated && generated.appType && generated.sections) {
          const blueprint = generated as unknown as UIBlueprint;
          const assistantMsg: ChatMessage = {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: `Here's your ${blueprint.appType} app! I've assembled ${(blueprint.sections as unknown[]).length} sections with realistic mock data. Try refining it — ask me to add features, change the style, or restructure the layout.`,
            blueprint,
          };
          setMessages((prev) => [...prev, assistantMsg]);
          dispatch({ type: "PUSH_BLUEPRINT", blueprint, prompt });
          setIsGenerating(false);
          return;
        }
      } catch (err) {
        console.warn("[Forge] Groq generation failed:", err);
      }
    }

    // Fallback: no match and no Groq
    const fallbackMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: "assistant",
      content: hasGroq
        ? "I had trouble generating that blueprint. Try rephrasing your idea or use one of the suggested prompts below."
        : "I'd love to help build that! Try one of the suggested prompts to see a full demo, or add a Groq API key for AI-powered generation of any idea.",
    };
    setMessages((prev) => [...prev, fallbackMsg]);
    setIsGenerating(false);
  }

  /* ── Form submit ─────────────────────────────────────────────────── */

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isPending) return;

    if (tamboConnected && tamboSubmit) {
      tamboSubmit(trimmed);
    } else {
      handleDemoSubmit(trimmed);
    }
    setInput("");
  }

  function handleSuggestionClick(prompt: string) {
    setInput(prompt);
    if (tamboConnected && tamboSubmit) {
      tamboSubmit(prompt);
    } else {
      handleDemoSubmit(prompt);
    }
  }

  /* ── Render helpers ──────────────────────────────────────────────── */

  const displayMessages = tamboConnected
    ? (tamboMessages ?? []).map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
      }))
    : messages;

  const showWelcome = displayMessages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* ── Messages area ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {showWelcome && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-4">
              <Hammer size={28} className="text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Welcome to Forge</h2>
            <p className="text-sm text-gray-400 max-w-sm mb-6">
              Describe a product idea and I'll build a live, interactive React app
              for you — powered by AI.
            </p>

            {/* Demo prompts */}
            <div className="flex flex-wrap gap-2 justify-center">
              {DEMO_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSuggestionClick(prompt)}
                  className="px-3 py-1.5 text-xs rounded-full border border-gray-700 text-gray-300 hover:border-indigo-500/50 hover:text-indigo-300 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {displayMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-500/20 text-indigo-100 rounded-br-sm"
                  : "bg-gray-800/80 text-gray-300 rounded-bl-sm border border-gray-700/40"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isPending && (
          <div className="flex justify-start">
            <div className="bg-gray-800/80 rounded-xl rounded-bl-sm border border-gray-700/40 px-4 py-2.5 flex items-center gap-2 text-sm text-gray-400">
              <Loader2 size={14} className="animate-spin" />
              Building your app…
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Revision breadcrumbs ───────────────────────────────────── */}
      {history.length > 1 && (
        <div className="px-4 py-2 border-t border-gray-700/30 flex items-center gap-1 overflow-x-auto">
          <span className="text-[10px] text-gray-500 mr-1 shrink-0">Revisions:</span>
          {history.map((snap, i) => (
            <button
              key={i}
              onClick={() => dispatch({ type: "SET_ACTIVE_INDEX", index: i })}
              className={`px-2 py-0.5 text-[10px] rounded-full shrink-0 transition-colors ${
                i === activeIndex
                  ? "bg-indigo-500/30 text-indigo-300"
                  : "bg-gray-800 text-gray-500 hover:text-gray-300"
              }`}
            >
              v{snap.revision}
            </button>
          ))}
        </div>
      )}

      {/* ── Input area ─────────────────────────────────────────────── */}
      <form
        onSubmit={onSubmit}
        className="p-3 border-t border-gray-700/50"
      >
        <div className="flex items-center gap-2 bg-gray-800/80 rounded-xl border border-gray-700/50 focus-within:border-indigo-500/50 px-3 py-2 transition-colors">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your product idea…"
            disabled={isPending}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isPending}
            className="p-1.5 rounded-lg bg-indigo-500 text-white disabled:opacity-30 hover:bg-indigo-400 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
