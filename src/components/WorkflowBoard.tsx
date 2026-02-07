/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Workflow Board (Figma-like Pipeline)
 *
 * Visual pipeline showing the product-building stages:
 *   Ideate → Design → Build → Preview → Ship
 *
 * Each stage shows:
 *   • Status indicator (pending / active / completed)
 *   • Description of what happens at that stage
 *   • Artifacts linked to the stage
 *   • Click to navigate to the relevant tab
 * ════════════════════════════════════════════════════════════════════════
 */

import {
  Lightbulb,
  Palette,
  Hammer,
  Eye,
  Rocket,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  FileText,
  Image,
  Boxes,
} from "lucide-react";
import { useForge, type WorkflowNode, type ViewTab } from "../lib/forgeState";
import { hasGroq } from "../lib/groqClient";

const stageIcons: Record<string, React.ReactNode> = {
  ideate: <Lightbulb size={22} />,
  design: <Palette size={22} />,
  build: <Hammer size={22} />,
  preview: <Eye size={22} />,
  ship: <Rocket size={22} />,
};

const stageColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  ideate: { bg: "bg-violet-500/15", border: "border-violet-500/40", text: "text-violet-400", glow: "shadow-violet-500/20" },
  design: { bg: "bg-pink-500/15", border: "border-pink-500/40", text: "text-pink-400", glow: "shadow-pink-500/20" },
  build: { bg: "bg-indigo-500/15", border: "border-indigo-500/40", text: "text-indigo-400", glow: "shadow-indigo-500/20" },
  preview: { bg: "bg-emerald-500/15", border: "border-emerald-500/40", text: "text-emerald-400", glow: "shadow-emerald-500/20" },
  ship: { bg: "bg-amber-500/15", border: "border-amber-500/40", text: "text-amber-400", glow: "shadow-amber-500/20" },
};

const stageTabMap: Record<string, ViewTab> = {
  ideate: "notebook",
  design: "assets",
  build: "build",
  preview: "preview",
  ship: "preview",
};

function StatusBadge({ status }: { status: WorkflowNode["status"] }) {
  if (status === "completed") {
    return <CheckCircle2 size={14} className="text-emerald-400" />;
  }
  if (status === "active") {
    return <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 animate-pulse" />;
  }
  return <Circle size={14} className="text-gray-600" />;
}

export default function WorkflowBoard() {
  const { workflowNodes, dispatch, history, notebookBlocks, assets } = useForge();

  function navigateToStage(stage: string) {
    dispatch({ type: "SET_TAB", tab: stageTabMap[stage] || "build" });
  }

  // Summary stats
  const totalRevisions = history.length;
  const totalNotes = notebookBlocks.length;
  const totalAssets = assets.length;
  const completedStages = workflowNodes.filter((n) => n.status === "completed").length;
  const progress = Math.round((completedStages / workflowNodes.length) * 100);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-950/50">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-900/80 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Boxes size={20} className="text-indigo-400" />
              Product Workflow
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Track your app's journey from idea to deployment
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 font-mono">{progress}%</span>
            </div>

            {hasGroq && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/30">
                Groq AI Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Pipeline visualization ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Pipeline nodes */}
        <div className="flex items-stretch gap-3 mb-8">
          {workflowNodes.map((node, i) => {
            const colors = stageColors[node.stage];
            const isActive = node.status === "active";
            const isCompleted = node.status === "completed";

            return (
              <div key={node.id} className="flex items-stretch flex-1">
                <button
                  onClick={() => navigateToStage(node.stage)}
                  className={`flex-1 rounded-xl border p-4 transition-all duration-300 text-left
                    ${isActive
                      ? `${colors.bg} ${colors.border} shadow-lg ${colors.glow}`
                      : isCompleted
                        ? `bg-gray-800/60 border-gray-700/50 hover:${colors.bg}`
                        : "bg-gray-900/40 border-gray-800/50 opacity-50"
                    }
                    ${!isActive && !isCompleted ? "" : "hover:scale-[1.02] cursor-pointer"}
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`${isActive ? colors.text : isCompleted ? "text-gray-400" : "text-gray-600"}`}>
                      {stageIcons[node.stage]}
                    </div>
                    <StatusBadge status={node.status} />
                  </div>
                  <h3 className={`font-semibold text-sm ${isActive ? "text-white" : isCompleted ? "text-gray-300" : "text-gray-600"}`}>
                    {node.label}
                  </h3>
                  <p className={`text-[11px] mt-1 leading-relaxed ${isActive ? "text-gray-300" : "text-gray-600"}`}>
                    {node.description}
                  </p>
                  {node.artifacts.length > 0 && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800/80 text-gray-400">
                        {node.artifacts.length} artifact{node.artifacts.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </button>

                {i < workflowNodes.length - 1 && (
                  <div className="flex items-center px-1">
                    <ArrowRight size={16} className={isCompleted ? "text-gray-500" : "text-gray-700"} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Project summary cards ────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => dispatch({ type: "SET_TAB", tab: "notebook" })}
            className="rounded-xl bg-gray-900/60 border border-gray-800/50 p-4 hover:border-violet-500/30 transition-colors text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-violet-400" />
              <span className="text-sm font-semibold text-white">Notes</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalNotes}</p>
            <p className="text-[11px] text-gray-500 mt-1">
              {totalNotes === 0 ? "Start writing your ideas" : "blocks in notebook"}
            </p>
          </button>

          <button
            onClick={() => dispatch({ type: "SET_TAB", tab: "assets" })}
            className="rounded-xl bg-gray-900/60 border border-gray-800/50 p-4 hover:border-pink-500/30 transition-colors text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <Image size={16} className="text-pink-400" />
              <span className="text-sm font-semibold text-white">Assets</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalAssets}</p>
            <p className="text-[11px] text-gray-500 mt-1">
              {totalAssets === 0 ? "Upload designs & images" : "files uploaded"}
            </p>
          </button>

          <button
            onClick={() => dispatch({ type: "SET_TAB", tab: "build" })}
            className="rounded-xl bg-gray-900/60 border border-gray-800/50 p-4 hover:border-indigo-500/30 transition-colors text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-indigo-400" />
              <span className="text-sm font-semibold text-white">Revisions</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalRevisions}</p>
            <p className="text-[11px] text-gray-500 mt-1">
              {totalRevisions === 0 ? "Describe your idea to start" : "blueprint versions"}
            </p>
          </button>
        </div>

        {/* ── Activity timeline ─────────────────────────────────────── */}
        <div className="rounded-xl bg-gray-900/60 border border-gray-800/50 p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Recent Activity
          </h3>
          {history.length === 0 && notebookBlocks.length === 0 && assets.length === 0 ? (
            <p className="text-xs text-gray-600 py-4 text-center">
              No activity yet. Start by writing notes or describing your idea in the Build tab.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {/* Show last 10 activities */}
              {[
                ...history.map((h) => ({
                  time: h.createdAt,
                  label: `Built v${h.revision}: "${h.prompt.slice(0, 50)}"`,
                  icon: <Hammer size={12} className="text-indigo-400" />,
                })),
                ...notebookBlocks.slice(-5).map((b) => ({
                  time: b.createdAt,
                  label: `Note: ${b.content.slice(0, 50) || b.type}`,
                  icon: <FileText size={12} className="text-violet-400" />,
                })),
                ...assets.slice(-5).map((a) => ({
                  time: a.createdAt,
                  label: `Uploaded: ${a.name}`,
                  icon: <Image size={12} className="text-pink-400" />,
                })),
              ]
                .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                .slice(0, 10)
                .map((activity, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-400 py-1.5 border-b border-gray-800/50 last:border-0">
                    {activity.icon}
                    <span className="flex-1 truncate">{activity.label}</span>
                    <span className="text-gray-600 shrink-0 font-mono">
                      {new Date(activity.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
