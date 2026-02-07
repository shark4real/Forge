/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Main Application Shell (v2)
 *
 * Tab-based layout with 5 views:
 *   Build     — Chat + Preview + Explainability (original 3-column)
 *   Workflow  — Figma-like visual pipeline
 *   Notebook  — Notion-style block editor
 *   Assets    — Upload & manage images / designs
 *   Preview   — Full-screen device-frame preview + export
 *
 * Supports two modes:
 *   1. TAMBO MODE — AI flows through Tambo Cloud
 *   2. DEMO MODE — pre-baked example blueprints
 * ════════════════════════════════════════════════════════════════════════
 */

import {
  Hammer,
  MessageSquare,
  GitBranch,
  BookOpen,
  ImageIcon,
  Eye,
} from "lucide-react";
import { useForge, type ViewTab } from "../lib/forgeState";
import ChatInterface from "./ChatInterface";
import PreviewCanvas from "./PreviewCanvas";
import ExplainabilityPanel from "./ExplainabilityPanel";
import WorkflowBoard from "./WorkflowBoard";
import Notebook from "./Notebook";
import AssetManager from "./AssetManager";
import LivePreview from "./LivePreview";
import { useTamboThread, useTamboThreadInput, useTamboGenerationStage } from "@tambo-ai/react";
import type { UIBlueprint } from "../types/blueprint";
import React, { useEffect, useRef, useMemo } from "react";

/* ── Error boundary for Tambo subtree ─────────────────────────────── */

class TamboBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[Forge] Tambo error caught:", err.message);
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

/* ── ConnectedChat — bridges Tambo hooks → ChatInterface props ────── */

function ConnectedChat() {
  const { dispatch } = useForge();
  const { thread } = useTamboThread();
  const { setValue, submit } = useTamboThreadInput();
  const { generationStage } = useTamboGenerationStage();
  const lastMessageCountRef = useRef(0);

  const rawMessages = thread?.messages ?? [];

  const messages = useMemo(
    () =>
      rawMessages.map((m: any) => ({
        id: m.id ?? String(Math.random()),
        role: (m.role ?? "assistant") as string,
        content:
          typeof m.content === "string"
            ? m.content
            : Array.isArray(m.content)
              ? m.content.map((c: any) => c.text ?? "").join("")
              : JSON.stringify(m.content ?? ""),
        renderedComponent: m.renderedComponent,
      })),
    [rawMessages],
  );

  const isPending =
    generationStage !== "IDLE" &&
    generationStage !== "COMPLETE" &&
    generationStage !== "ERROR" &&
    generationStage !== "CANCELLED";

  /* Watch for newly rendered ForgeBlueprint components and dispatch */
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current) {
      const latestAssistant = [...messages]
        .reverse()
        .find((m: any) => m.role === "assistant" && m.renderedComponent);
      if (latestAssistant?.renderedComponent) {
        try {
          const props = (latestAssistant.renderedComponent as any)?.props;
          if (props && props.appType && props.sections) {
            dispatch({
              type: "PUSH_BLUEPRINT",
              blueprint: props as UIBlueprint,
              prompt: "Tambo AI",
            });
          }
        } catch {
          /* ignore extraction errors */
        }
      }
      lastMessageCountRef.current = messages.length;
    }
  }, [messages, dispatch]);

  function handleSubmit(text: string) {
    setValue(text);
    setTimeout(() => submit(), 50);
  }

  return (
    <ChatInterface
      tamboConnected
      tamboMessages={messages}
      tamboSubmit={handleSubmit}
      tamboIsPending={isPending}
    />
  );
}

/* ── Tab definitions ───────────────────────────────────────────────── */

const tabs: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
  { id: "build",    label: "Build",    icon: <MessageSquare size={14} /> },
  { id: "workflow", label: "Workflow",  icon: <GitBranch size={14} /> },
  { id: "notebook", label: "Notebook", icon: <BookOpen size={14} /> },
  { id: "assets",   label: "Assets",   icon: <ImageIcon size={14} /> },
  { id: "preview",  label: "Preview",  icon: <Eye size={14} /> },
];

/* ── Props ─────────────────────────────────────────────────────────── */

interface ForgeAppProps {
  tamboConnected?: boolean;
}

/* ── Component ─────────────────────────────────────────────────────── */

export default function ForgeApp({ tamboConnected = false }: ForgeAppProps) {
  const {
    activeBlueprint,
    activeIndex,
    history,
    showExplainability,
    activeTab,
    notebookBlocks,
    assets,
    dispatch,
  } = useForge();

  const revision = activeIndex >= 0 ? history[activeIndex].revision : 0;
  const explanation = activeBlueprint?.explanation;

  function handleSuggestionFromPanel(_suggestion: string) {
    dispatch({ type: "TOGGLE_EXPLAINABILITY" });
  }

  /* ── Badge counts ────────────────────────────────────────────────── */
  const badgeMap: Partial<Record<ViewTab, number>> = {};
  if (notebookBlocks.length > 1) badgeMap.notebook = notebookBlocks.length;
  if (assets.length > 0) badgeMap.assets = assets.length;
  if (history.length > 0) badgeMap.preview = history.length;

  return (
    <div className="h-full flex flex-col">
      {/* ── Top bar ────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-700/50 bg-gray-900/90 shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Hammer size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-wide">
            Forge
          </span>
          <span className="text-[10px] text-gray-500 ml-1 hidden sm:inline">
            AI Product Builder
          </span>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-0.5 bg-gray-800/60 rounded-lg p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: "SET_TAB", tab: tab.id })}
              className={`
                relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                ${
                  activeTab === tab.id
                    ? "bg-gray-700/80 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/40"
                }
              `}
            >
              {tab.icon}
              <span className="hidden md:inline">{tab.label}</span>
              {badgeMap[tab.id] != null && (
                <span className="ml-0.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] flex items-center justify-center bg-indigo-500/30 text-indigo-300 font-semibold">
                  {badgeMap[tab.id]}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Status */}
        <div className="flex items-center gap-3">
          {!tamboConnected && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Demo
            </span>
          )}
          {tamboConnected && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/30">
              Tambo
            </span>
          )}
        </div>
      </header>

      {/* ── Tab content ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        {/* BUILD — original 3-column layout */}
        {activeTab === "build" && (
          <div className="h-full flex overflow-hidden">
            <div className="w-96 shrink-0 border-r border-gray-700/50 bg-gray-900/60">
              {tamboConnected ? (
                <TamboBoundary fallback={<ChatInterface tamboConnected={false} />}>
                  <ConnectedChat />
                </TamboBoundary>
              ) : (
                <ChatInterface tamboConnected={false} />
              )}
            </div>

            <PreviewCanvas
              blueprint={activeBlueprint}
              revision={revision}
              showExplainability={showExplainability}
              onToggleExplainability={() =>
                dispatch({ type: "TOGGLE_EXPLAINABILITY" })
              }
            />

            {showExplainability && explanation && (
              <ExplainabilityPanel
                explanation={explanation}
                revision={revision}
                onClose={() => dispatch({ type: "TOGGLE_EXPLAINABILITY" })}
                onSuggestionClick={handleSuggestionFromPanel}
              />
            )}
          </div>
        )}

        {/* WORKFLOW — Figma-like pipeline */}
        {activeTab === "workflow" && <WorkflowBoard />}

        {/* NOTEBOOK — Notion-style block editor */}
        {activeTab === "notebook" && <Notebook />}

        {/* ASSETS — Upload & manage designs */}
        {activeTab === "assets" && <AssetManager />}

        {/* PREVIEW — Full-screen device-frame preview */}
        {activeTab === "preview" && <LivePreview />}
      </div>
    </div>
  );
}
