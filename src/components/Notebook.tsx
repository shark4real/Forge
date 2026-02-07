/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Notion-like Notebook
 *
 * Block-based editor for users to plan and document their app ideas.
 * Supports: headings, paragraphs, bullet lists, checklists, code blocks,
 * callouts, and dividers.
 *
 * Features:
 *   • Type "/" to see the block menu
 *   • Press Enter to create new blocks
 *   • Backspace on empty block to delete
 *   • AI-powered "Refine with AI" button (requires Groq)
 * ════════════════════════════════════════════════════════════════════════
 */

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Plus,
  Trash2,
  Type,
  AlignLeft,
  List,
  CheckSquare,
  Code2,
  Minus,
  AlertCircle,
  Sparkles,
  GripVertical,
  FileText,
  Wand2,
} from "lucide-react";
import { nanoid } from "nanoid";
import {
  useForge,
  type NotebookBlock,
  type NotebookBlockType,
} from "../lib/forgeState";
import { hasGroq, refineIdeaWithGroq } from "../lib/groqClient";

/* ── Block type definitions ────────────────────────────────────────── */

const blockTypes: { type: NotebookBlockType; label: string; icon: React.ReactNode; shortcut: string }[] = [
  { type: "heading", label: "Heading", icon: <Type size={14} />, shortcut: "# " },
  { type: "paragraph", label: "Text", icon: <AlignLeft size={14} />, shortcut: "" },
  { type: "bullet", label: "Bullet List", icon: <List size={14} />, shortcut: "- " },
  { type: "checklist", label: "Checklist", icon: <CheckSquare size={14} />, shortcut: "[] " },
  { type: "code", label: "Code", icon: <Code2 size={14} />, shortcut: "```" },
  { type: "callout", label: "Callout", icon: <AlertCircle size={14} />, shortcut: "> " },
  { type: "divider", label: "Divider", icon: <Minus size={14} />, shortcut: "---" },
];

/* ── Individual block editor ───────────────────────────────────────── */

function BlockEditor({
  block,
  onUpdate,
  onDelete,
  onNewBelow,
  autoFocus,
}: {
  block: NotebookBlock;
  onUpdate: (changes: Partial<NotebookBlock>) => void;
  onDelete: () => void;
  onNewBelow: () => void;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [autoFocus]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && block.type !== "code") {
      e.preventDefault();
      onNewBelow();
    }
    if (e.key === "Backspace" && block.content === "" && block.type !== "divider") {
      e.preventDefault();
      onDelete();
    }
    if (e.key === "/" && block.content === "") {
      setShowMenu(true);
    }
  }

  function handleTypeChange(newType: NotebookBlockType) {
    onUpdate({ type: newType });
    setShowMenu(false);
    setTimeout(() => ref.current?.focus(), 50);
  }

  // Render based on type
  const baseClasses = "w-full bg-transparent border-none focus:outline-none resize-none text-gray-200 placeholder-gray-600";

  return (
    <div className="group relative flex items-start gap-2 py-1 hover:bg-gray-800/30 rounded-lg px-2 -mx-2 transition-colors">
      {/* Drag handle + actions */}
      <div className="flex items-center gap-0.5 pt-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button className="p-0.5 text-gray-600 hover:text-gray-400 cursor-grab" title="Drag to reorder">
          <GripVertical size={14} />
        </button>
        <button onClick={onDelete} className="p-0.5 text-gray-600 hover:text-red-400" title="Delete">
          <Trash2 size={12} />
        </button>
      </div>

      <div className="flex-1 min-w-0">
        {block.type === "divider" ? (
          <div className="border-t border-gray-700/50 my-3" />
        ) : block.type === "heading" ? (
          <input
            ref={ref as React.RefObject<HTMLInputElement>}
            value={block.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Heading…"
            className={`${baseClasses} text-xl font-bold`}
          />
        ) : block.type === "code" ? (
          <div className="rounded-lg bg-gray-900 border border-gray-800 p-3 font-mono text-sm">
            <textarea
              ref={ref as React.RefObject<HTMLTextAreaElement>}
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && block.content === "") {
                  e.preventDefault();
                  onDelete();
                }
              }}
              placeholder="// code here…"
              rows={3}
              className={`${baseClasses} text-emerald-300 font-mono text-sm`}
            />
          </div>
        ) : block.type === "checklist" ? (
          <div className="flex items-start gap-2">
            <button
              onClick={() => onUpdate({ checked: !block.checked })}
              className={`mt-1 w-4 h-4 rounded border shrink-0 flex items-center justify-center
                ${block.checked
                  ? "bg-indigo-500 border-indigo-500"
                  : "border-gray-600 hover:border-indigo-400"
                }`}
            >
              {block.checked && <span className="text-white text-[10px]">✓</span>}
            </button>
            <input
              ref={ref as React.RefObject<HTMLInputElement>}
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="To-do item…"
              className={`${baseClasses} text-sm ${block.checked ? "line-through text-gray-500" : ""}`}
            />
          </div>
        ) : block.type === "callout" ? (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-2">
            <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
            <textarea
              ref={ref as React.RefObject<HTMLTextAreaElement>}
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="Important note…"
              rows={2}
              className={`${baseClasses} text-sm text-amber-200`}
            />
          </div>
        ) : block.type === "bullet" ? (
          <div className="flex items-start gap-2">
            <span className="text-gray-500 mt-0.5 shrink-0">•</span>
            <input
              ref={ref as React.RefObject<HTMLInputElement>}
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="List item…"
              className={`${baseClasses} text-sm`}
            />
          </div>
        ) : (
          <textarea
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            value={block.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Type '/' for commands, or just start writing…"
            rows={1}
            className={`${baseClasses} text-sm`}
            style={{ minHeight: "1.5rem" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = target.scrollHeight + "px";
            }}
          />
        )}

        {/* Slash command menu */}
        {showMenu && (
          <div className="absolute left-8 top-full mt-1 z-50 w-56 rounded-xl bg-gray-900 border border-gray-700 shadow-xl py-1 animate-fade-in">
            <p className="px-3 py-1.5 text-[10px] text-gray-500 uppercase tracking-wider">Block Type</p>
            {blockTypes.map((bt) => (
              <button
                key={bt.type}
                onClick={() => handleTypeChange(bt.type)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 transition-colors"
              >
                <span className="text-gray-500">{bt.icon}</span>
                {bt.label}
                <span className="ml-auto text-gray-600 font-mono">{bt.shortcut}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Notebook component ───────────────────────────────────────── */

export default function Notebook() {
  const { notebookBlocks, dispatch } = useForge();
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [refinedPrompt, setRefinedPrompt] = useState<string | null>(null);

  const addBlock = useCallback(
    (type: NotebookBlockType = "paragraph", afterId?: string) => {
      const newBlock: NotebookBlock = {
        id: nanoid(8),
        type,
        content: "",
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_BLOCK", block: newBlock });
      setFocusedId(newBlock.id);
    },
    [dispatch],
  );

  async function handleRefineWithAI() {
    if (!hasGroq) return;
    setIsRefining(true);
    setRefinedPrompt(null);

    const notebookContext = notebookBlocks
      .map((b) => {
        if (b.type === "heading") return `# ${b.content}`;
        if (b.type === "bullet") return `- ${b.content}`;
        if (b.type === "checklist") return `[${b.checked ? "x" : " "}] ${b.content}`;
        if (b.type === "code") return `\`\`\`\n${b.content}\n\`\`\``;
        if (b.type === "callout") return `> ${b.content}`;
        return b.content;
      })
      .filter(Boolean)
      .join("\n");

    const result = await refineIdeaWithGroq(notebookContext);
    setRefinedPrompt(result);
    setIsRefining(false);
  }

  function handleUseRefinedPrompt() {
    if (!refinedPrompt) return;
    dispatch({ type: "SET_TAB", tab: "build" });
    // The refined prompt will be used in the chat — for now copy to clipboard
    navigator.clipboard.writeText(refinedPrompt).catch(() => {});
    setRefinedPrompt(null);
  }

  const isEmpty = notebookBlocks.length === 0;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-950/50">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-900/80 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText size={20} className="text-violet-400" />
              Notebook
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Plan your product — notes, checklists, and ideas
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasGroq && (
              <button
                onClick={handleRefineWithAI}
                disabled={isEmpty || isRefining}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 disabled:opacity-40 transition-colors"
              >
                <Wand2 size={12} className={isRefining ? "animate-spin" : ""} />
                {isRefining ? "Refining…" : "Refine with AI"}
              </button>
            )}
            <span className="text-[10px] text-gray-600">
              {notebookBlocks.length} block{notebookBlocks.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* ── Refined prompt banner ───────────────────────────────────── */}
      {refinedPrompt && (
        <div className="mx-6 mt-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-300">AI-Refined Prompt</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-3">{refinedPrompt}</p>
          <div className="flex gap-2">
            <button
              onClick={handleUseRefinedPrompt}
              className="px-3 py-1.5 text-xs rounded-lg bg-indigo-500 text-white hover:bg-indigo-400 transition-colors"
            >
              Copy & Go to Build
            </button>
            <button
              onClick={() => setRefinedPrompt(null)}
              className="px-3 py-1.5 text-xs rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Editor area ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
              <FileText size={28} className="text-violet-500/50" />
            </div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Start your product notebook</h3>
            <p className="text-xs text-gray-600 max-w-sm mb-4">
              Write down your ideas, create checklists, add code snippets — everything you need
              to plan your app before building it.
            </p>
            <button
              onClick={() => addBlock("heading")}
              className="flex items-center gap-2 px-4 py-2 text-xs rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30 transition-colors"
            >
              <Plus size={14} />
              Add first block
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-1">
            {notebookBlocks.map((block) => (
              <BlockEditor
                key={block.id}
                block={block}
                autoFocus={block.id === focusedId}
                onUpdate={(changes) =>
                  dispatch({ type: "UPDATE_BLOCK", id: block.id, changes })
                }
                onDelete={() => dispatch({ type: "DELETE_BLOCK", id: block.id })}
                onNewBelow={() => addBlock("paragraph", block.id)}
              />
            ))}

            {/* Add block button */}
            <button
              onClick={() => addBlock("paragraph")}
              className="w-full flex items-center gap-2 py-2 px-2 text-xs text-gray-600 hover:text-gray-400 rounded-lg hover:bg-gray-800/30 transition-colors"
            >
              <Plus size={14} />
              Add block
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom toolbar ──────────────────────────────────────────── */}
      <div className="px-6 py-2 border-t border-gray-700/50 bg-gray-900/80 shrink-0">
        <div className="flex items-center gap-1">
          {blockTypes.slice(0, -1).map((bt) => (
            <button
              key={bt.type}
              onClick={() => addBlock(bt.type)}
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
              title={`Add ${bt.label}`}
            >
              {bt.icon}
            </button>
          ))}
          <div className="w-px h-4 bg-gray-800 mx-1" />
          <button
            onClick={() => addBlock("divider")}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
            title="Add Divider"
          >
            <Minus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
