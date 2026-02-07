/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Main Application Shell (v3)
 *
 * Tab-based layout with 5 views:
 *   Build     — Chat + Preview + Explainability (Groq AI powered)
 *   Workflow  — Figma-like visual pipeline
 *   Notebook  — Notion-style block editor
 *   Assets    — Upload & manage images / designs
 *   Preview   — Full-screen device-frame preview + export
 *
 * AI generation: Groq (Llama 3.3 70B) + demo blueprint fallbacks
 * ════════════════════════════════════════════════════════════════════════
 */

import {
  Hammer,
  MessageSquare,
  GitBranch,
  BookOpen,
  ImageIcon,
  Eye,
  Zap,
} from "lucide-react";
import { useForge, type ViewTab } from "../lib/forgeState";
import { hasGroq } from "../lib/groqClient";
import ChatInterface from "./ChatInterface";
import PreviewCanvas from "./PreviewCanvas";
import ExplainabilityPanel from "./ExplainabilityPanel";
import WorkflowBoard from "./WorkflowBoard";
import Notebook from "./Notebook";
import AssetManager from "./AssetManager";
import LivePreview from "./LivePreview";

/* ── Tab definitions ───────────────────────────────────────────────── */

const tabs: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
  { id: "build",    label: "Build",    icon: <MessageSquare size={14} /> },
  { id: "workflow", label: "Workflow",  icon: <GitBranch size={14} /> },
  { id: "notebook", label: "Notebook", icon: <BookOpen size={14} /> },
  { id: "assets",   label: "Assets",   icon: <ImageIcon size={14} /> },
  { id: "preview",  label: "Preview",  icon: <Eye size={14} /> },
];

/* ── Component ─────────────────────────────────────────────────────── */

export default function ForgeApp() {
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
        <div className="flex items-center gap-2">
          {hasGroq ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/30 flex items-center gap-1">
              <Zap size={8} /> Groq AI
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Demo
            </span>
          )}
        </div>
      </header>

      {/* ── Tab content ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        {/* BUILD — Chat + Preview */}
        {activeTab === "build" && (
          <div className="h-full flex overflow-hidden">
            <div className="w-96 shrink-0 border-r border-gray-700/50 bg-gray-900/60">
              <ChatInterface />
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
