/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Application State (React Context)
 *
 * Manages:
 *   • Blueprint history (snapshots with revision numbers)
 *   • Notebook blocks (Notion-like notes)
 *   • Uploaded assets
 *   • Workflow pipeline stages
 *   • Active view tab
 *   • Explainability panel visibility
 * ════════════════════════════════════════════════════════════════════════
 */

import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import type { UIBlueprint, BlueprintSnapshot } from "../types/blueprint";

/* ══════════════════════════════════════════════════════════════════════
   NOTEBOOK TYPES
   ═════════════════════════════════════════════════════════════════════ */

export type NotebookBlockType =
  | "heading"
  | "paragraph"
  | "bullet"
  | "checklist"
  | "code"
  | "divider"
  | "callout";

export interface NotebookBlock {
  id: string;
  type: NotebookBlockType;
  content: string;
  checked?: boolean;
  language?: string;
  color?: string;
  createdAt: string;
}

/* ══════════════════════════════════════════════════════════════════════
   ASSET TYPES
   ═════════════════════════════════════════════════════════════════════ */

export interface UploadedAsset {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  createdAt: string;
  tags: string[];
}

/* ══════════════════════════════════════════════════════════════════════
   WORKFLOW TYPES
   ═════════════════════════════════════════════════════════════════════ */

export type WorkflowStage =
  | "ideate"
  | "design"
  | "build"
  | "preview"
  | "ship";

export interface WorkflowNode {
  id: string;
  stage: WorkflowStage;
  label: string;
  description: string;
  status: "pending" | "active" | "completed";
  artifacts: string[];
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN STATE
   ═════════════════════════════════════════════════════════════════════ */

export type ViewTab = "build" | "workflow" | "notebook" | "assets" | "preview";

interface ForgeState {
  history: BlueprintSnapshot[];
  activeIndex: number;
  showExplainability: boolean;
  notebookBlocks: NotebookBlock[];
  assets: UploadedAsset[];
  workflowNodes: WorkflowNode[];
  activeTab: ViewTab;
}

const defaultWorkflow: WorkflowNode[] = [
  {
    id: "wf-ideate",
    stage: "ideate",
    label: "Ideate",
    description: "Describe your product idea, write notes, and gather inspiration",
    status: "active",
    artifacts: [],
  },
  {
    id: "wf-design",
    stage: "design",
    label: "Design",
    description: "Upload assets, define color schemes, and plan your layout",
    status: "pending",
    artifacts: [],
  },
  {
    id: "wf-build",
    stage: "build",
    label: "Build",
    description: "AI assembles your app from the component registry",
    status: "pending",
    artifacts: [],
  },
  {
    id: "wf-preview",
    stage: "preview",
    label: "Preview",
    description: "Test your app in desktop & mobile views, iterate on design",
    status: "pending",
    artifacts: [],
  },
  {
    id: "wf-ship",
    stage: "ship",
    label: "Ship",
    description: "Export your app as HTML/React code and deploy",
    status: "pending",
    artifacts: [],
  },
];

const initialState: ForgeState = {
  history: [],
  activeIndex: -1,
  showExplainability: false,
  notebookBlocks: [],
  assets: [],
  workflowNodes: defaultWorkflow,
  activeTab: "build",
};

/* ══════════════════════════════════════════════════════════════════════
   ACTIONS
   ═════════════════════════════════════════════════════════════════════ */

type ForgeAction =
  | {
      type: "PUSH_BLUEPRINT";
      blueprint: UIBlueprint;
      prompt: string;
      rawInput?: Record<string, unknown>;
      normalizationWarnings?: BlueprintSnapshot["normalizationWarnings"];
    }
  | { type: "SET_ACTIVE_INDEX"; index: number }
  | { type: "TOGGLE_EXPLAINABILITY" }
  | { type: "RESET" }
  | { type: "SET_TAB"; tab: ViewTab }
  | { type: "ADD_BLOCK"; block: NotebookBlock }
  | { type: "UPDATE_BLOCK"; id: string; changes: Partial<NotebookBlock> }
  | { type: "DELETE_BLOCK"; id: string }
  | { type: "REORDER_BLOCKS"; fromIndex: number; toIndex: number }
  | { type: "ADD_ASSET"; asset: UploadedAsset }
  | { type: "REMOVE_ASSET"; id: string }
  | { type: "TAG_ASSET"; id: string; tags: string[] }
  | { type: "SET_WORKFLOW_STATUS"; nodeId: string; status: WorkflowNode["status"] }
  | { type: "ADVANCE_WORKFLOW" };

function forgeReducer(state: ForgeState, action: ForgeAction): ForgeState {
  switch (action.type) {
    /* ── Blueprint ──────────────────────────────────── */
    case "PUSH_BLUEPRINT": {
      const snapshot: BlueprintSnapshot = {
        revision: state.history.length + 1,
        createdAt: new Date().toISOString(),
        prompt: action.prompt,
        blueprint: action.blueprint,
        rawInput: action.rawInput,
        normalizationWarnings: action.normalizationWarnings,
      };
      const history = [...state.history, snapshot];
      const wf = state.workflowNodes.map((n) =>
        n.stage === "build"
          ? { ...n, status: "completed" as const, artifacts: [...n.artifacts, `rev-${history.length}`] }
          : n.stage === "preview"
            ? { ...n, status: "active" as const }
            : n,
      );
      return { ...state, history, activeIndex: history.length - 1, workflowNodes: wf };
    }
    case "SET_ACTIVE_INDEX":
      return { ...state, activeIndex: action.index };
    case "TOGGLE_EXPLAINABILITY":
      return { ...state, showExplainability: !state.showExplainability };
    case "RESET":
      return initialState;

    /* ── View tab ───────────────────────────────────── */
    case "SET_TAB":
      return { ...state, activeTab: action.tab };

    /* ── Notebook ───────────────────────────────────── */
    case "ADD_BLOCK": {
      const wf = state.workflowNodes.map((n) =>
        n.stage === "ideate" && n.status !== "completed"
          ? { ...n, status: "active" as const }
          : n,
      );
      return { ...state, notebookBlocks: [...state.notebookBlocks, action.block], workflowNodes: wf };
    }
    case "UPDATE_BLOCK":
      return {
        ...state,
        notebookBlocks: state.notebookBlocks.map((b) =>
          b.id === action.id ? { ...b, ...action.changes } : b,
        ),
      };
    case "DELETE_BLOCK":
      return {
        ...state,
        notebookBlocks: state.notebookBlocks.filter((b) => b.id !== action.id),
      };
    case "REORDER_BLOCKS": {
      const blocks = [...state.notebookBlocks];
      const [moved] = blocks.splice(action.fromIndex, 1);
      blocks.splice(action.toIndex, 0, moved);
      return { ...state, notebookBlocks: blocks };
    }

    /* ── Assets ─────────────────────────────────────── */
    case "ADD_ASSET": {
      const wf = state.workflowNodes.map((n) =>
        n.stage === "design"
          ? { ...n, status: "active" as const, artifacts: [...n.artifacts, action.asset.id] }
          : n.stage === "ideate" && n.status === "active"
            ? { ...n, status: "completed" as const }
            : n,
      );
      return { ...state, assets: [...state.assets, action.asset], workflowNodes: wf };
    }
    case "REMOVE_ASSET":
      return { ...state, assets: state.assets.filter((a) => a.id !== action.id) };
    case "TAG_ASSET":
      return {
        ...state,
        assets: state.assets.map((a) =>
          a.id === action.id ? { ...a, tags: action.tags } : a,
        ),
      };

    /* ── Workflow ────────────────────────────────────── */
    case "SET_WORKFLOW_STATUS":
      return {
        ...state,
        workflowNodes: state.workflowNodes.map((n) =>
          n.id === action.nodeId ? { ...n, status: action.status } : n,
        ),
      };
    case "ADVANCE_WORKFLOW": {
      const currentIdx = state.workflowNodes.findIndex((n) => n.status === "active");
      if (currentIdx < 0 || currentIdx >= state.workflowNodes.length - 1) return state;
      return {
        ...state,
        workflowNodes: state.workflowNodes.map((n, i) => {
          if (i === currentIdx) return { ...n, status: "completed" as const };
          if (i === currentIdx + 1) return { ...n, status: "active" as const };
          return n;
        }),
      };
    }

    default:
      return state;
  }
}

/* ══════════════════════════════════════════════════════════════════════
   CONTEXT
   ═════════════════════════════════════════════════════════════════════ */

interface ForgeContextValue extends ForgeState {
  dispatch: React.Dispatch<ForgeAction>;
  activeBlueprint: UIBlueprint | null;
}

const ForgeContext = createContext<ForgeContextValue | null>(null);

export function ForgeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(forgeReducer, initialState);

  const activeBlueprint =
    state.activeIndex >= 0 && state.activeIndex < state.history.length
      ? state.history[state.activeIndex].blueprint
      : null;

  return (
    <ForgeContext.Provider value={{ ...state, dispatch, activeBlueprint }}>
      {children}
    </ForgeContext.Provider>
  );
}

export function useForge(): ForgeContextValue {
  const ctx = useContext(ForgeContext);
  if (!ctx) throw new Error("useForge must be used inside <ForgeProvider>");
  return ctx;
}
