/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Blueprint Renderer (TAMBO'S ROLE: DYNAMIC UI RENDERING)
 *
 * RESPONSIBILITY SPLIT:
 *
 * • This module (Tambo's role):  Dynamically map component names → React
 * • normalizeBlueprint (Our role):  Validate/sanitize AI output BEFORE here
 *
 * Takes a PRE-NORMALIZED UIBlueprint (already sanitized) and renders React.
 *
 * Tambo is NOT responsible for:
 *   ❌ Validating AI output
 *   ❌ Fixing malformed props
 *   ❌ Preventing invalid React children
 *   ❌ Normalizing AI JSON
 *
 * Tambo IS responsible for:
 *   ✅ Mapping validated component names to React components from registry
 *   ✅ Re-rendering when blueprint changes
 *   ✅ Preserving UI continuity across updates
 *   ✅ Reporting component render failures (error boundaries)
 *
 * Defense-in-depth guarantees:
 *   1. Components resolved STRICTLY from registry (unknown → FallbackComponent)
 *   2. Every component wrapped in error boundary (isolation)
 *   3. One broken component never crashes entire app
 *   4. Props re-validated via Zod safeParse (double-check)
 *   5. Preview ALWAYS renders something (graceful degradation)
 * ════════════════════════════════════════════════════════════════════════
 */

import React, { createElement, useState, useEffect } from "react";
import { Edit3, Save, X } from "lucide-react";
import type { UIBlueprint, BlueprintSection, BlueprintComponent } from "../types/blueprint";
import { getRegistryEntry } from "../registry";

/* ── Props ─────────────────────────────────────────────────────────── */

export interface BlueprintRendererProps {
  blueprint: UIBlueprint;
  editMode?: boolean;
  onPropertyChange?: (sectionId: string, componentIndex: number, propPath: string, value: any) => void;
}

/* ── Per-component error boundary ──────────────────────────────────── */

class ComponentErrorBoundary extends React.Component<
  { name: string; children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  state = { hasError: false, errorMsg: "" };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error?.message ?? "Unknown render error" };
  }

  componentDidCatch(error: Error) {
    console.warn(`[Forge Renderer] Component "${this.props.name}" crashed:`, error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          <span className="font-semibold">⚠ Render warning</span>
          <span className="text-amber-400/70 ml-1">— {this.props.name}</span>
          <p className="text-xs text-amber-400/50 mt-1">{this.state.errorMsg}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Fallback for unknown components ───────────────────────────────── */

function FallbackComponent({ name }: { name: string }) {
  return (
    <div className="rounded-lg border border-gray-700/30 bg-gray-800/30 p-3 text-sm text-gray-500 italic">
      Component "{name}" is not in the registry — skipped.
    </div>
  );
}

/* ── Editable wrapper for components in edit mode ──────────────────── */

function EditableWrapper({
  children,
  componentName,
  props,
  onEdit,
  sectionId,
  componentIndex,
}: {
  children: React.ReactNode;
  componentName: string;
  props: Record<string, any>;
  onEdit?: (propPath: string, value: any) => void;
  sectionId: string;
  componentIndex: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, any>>(props);
  const [boxBgColor, setBoxBgColor] = useState(props.__boxBgColor || '#111827');
  const [boxBorderColor, setBoxBorderColor] = useState(props.__boxBorderColor || '#374151');

  // Sync state when props change (after save)
  useEffect(() => {
    setEditValues(props);
    setBoxBgColor(props.__boxBgColor || '#111827');
    setBoxBorderColor(props.__boxBorderColor || '#374151');
  }, [props]);

  const handleSave = () => {
    // Save component properties
    Object.keys(editValues).forEach((key) => {
      if (editValues[key] !== props[key]) {
        onEdit?.(key, editValues[key]);
      }
    });
    // Save box styling
    onEdit?.('__boxBgColor', boxBgColor);
    onEdit?.('__boxBorderColor', boxBorderColor);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValues(props);
    setBoxBgColor(props.__boxBgColor || '#111827');
    setBoxBorderColor(props.__boxBorderColor || '#374151');
    setIsEditing(false);
  };

  return (
    <div 
      className="relative group p-4" 
      style={{ 
        backgroundColor: boxBgColor,
        borderColor: boxBorderColor,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: '0px'
      }}
    >
      {/* Hover indicator with better visibility */}
      <div className="absolute -inset-2 border-2 border-transparent group-hover:border-indigo-500/50 group-hover:bg-indigo-500/5 transition-all pointer-events-none" />
      
      {/* Edit button - more visible */}
      {!isEditing && onEdit && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-2 right-2 p-2 bg-indigo-500 text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg z-10"
          title="✏️ Click to edit colors, sizes, and properties"
        >
          <Edit3 size={16} />
        </button>
      )}

      {/* Component badge with edit hint */}
      <div className="absolute top-2 left-2 px-2 py-1 bg-gray-900/90 text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity font-mono border border-indigo-500/30">
        {componentName}
        <span className="ml-1 text-indigo-400">• Click to edit →</span>
      </div>

      {/* The actual component */}
      {children}

      {/* Edit panel */}
      {isEditing && (
        <div className="absolute inset-0 bg-gray-900/95 p-4 z-20 overflow-auto border-2 border-indigo-500/50">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700">
            <div>
              <h4 className="text-sm font-semibold text-white">{componentName}</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Edit colors, sizes, and properties</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-2 bg-emerald-500 text-white hover:bg-emerald-400 transition-colors text-xs font-medium"
                title="Save changes"
              >
                <Save size={14} />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 px-3 py-2 bg-gray-700 text-white hover:bg-gray-600 transition-colors text-xs"
                title="Cancel"
              >
                <X size={14} />
                Cancel
              </button>
            </div>
          </div>

          {/* Box Styling Controls */}
          <div className="mb-4 p-3 bg-gray-800/50 border border-gray-700">
            <h5 className="text-xs font-semibold text-indigo-300 mb-3 flex items-center gap-2">
              🎨 Container Styling
            </h5>
            
            {/* Box Background Color */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Box Background Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={boxBgColor}
                  onChange={(e) => setBoxBgColor(e.target.value)}
                  className="w-12 h-9 bg-gray-800 border border-gray-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={boxBgColor}
                  onChange={(e) => setBoxBgColor(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm font-mono focus:border-indigo-500 focus:outline-none"
                  placeholder="#111827"
                />
              </div>
              {/* Quick presets */}
              <div className="flex gap-1 mt-2 flex-wrap">
                {['#111827', '#1f2937', '#374151', '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#ffffff'].map(color => (
                  <button
                    key={color}
                    onClick={() => setBoxBgColor(color)}
                    className="w-6 h-6 border border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Box Border Color */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Box Border Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={boxBorderColor}
                  onChange={(e) => setBoxBorderColor(e.target.value)}
                  className="w-12 h-9 bg-gray-800 border border-gray-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={boxBorderColor}
                  onChange={(e) => setBoxBorderColor(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm font-mono focus:border-indigo-500 focus:outline-none"
                  placeholder="#374151"
                />
              </div>
              {/* Quick presets */}
              <div className="flex gap-1 mt-2 flex-wrap">
                {['#374151', '#4b5563', '#6b7280', '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#000000'].map(color => (
                  <button
                    key={color}
                    onClick={() => setBoxBorderColor(color)}
                    className="w-6 h-6 border border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Component Properties */}
          <h5 className="text-xs font-semibold text-gray-300 mb-3 flex items-center gap-2">
            ⚙️ Component Properties
          </h5>

          <div className="space-y-3">
            {Object.entries(editValues).map(([key, value]) => {
              const keyLower = key.toLowerCase();
              const isColorProp = keyLower.includes('color') || keyLower.includes('bg') || 
                                  keyLower.includes('background') || keyLower.includes('border') ||
                                  keyLower.includes('accent') || keyLower.includes('theme');
              const isSizeProp = keyLower.includes('size') || keyLower.includes('width') || 
                                 keyLower.includes('height') || keyLower.includes('padding') ||
                                 keyLower.includes('margin') || keyLower.includes('gap');
              
              return (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">{key}</label>
                  {typeof value === "boolean" ? (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setEditValues({ ...editValues, [key]: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-xs text-gray-400">{value ? "Enabled" : "Disabled"}</span>
                    </label>
                  ) : typeof value === "number" ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => setEditValues({ ...editValues, [key]: parseFloat(e.target.value) })}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
                      />
                      <input
                        type="range"
                        min="0"
                        max={isSizeProp ? "200" : "100"}
                        value={value}
                        onChange={(e) => setEditValues({ ...editValues, [key]: parseFloat(e.target.value) })}
                        className="w-24"
                      />
                    </div>
                  ) : isColorProp && typeof value === "string" ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={value.startsWith('#') ? value : '#6366f1'}
                          onChange={(e) => setEditValues({ ...editValues, [key]: e.target.value })}
                          className="w-12 h-9 bg-gray-800 border border-gray-700 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={value?.toString() || ""}
                          onChange={(e) => setEditValues({ ...editValues, [key]: e.target.value })}
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm font-mono focus:border-indigo-500 focus:outline-none"
                          placeholder="#6366f1"
                        />
                      </div>
                      {/* Quick color presets */}
                      <div className="flex gap-1 flex-wrap">
                        {['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#1f2937', '#374151'].map(color => (
                          <button
                            key={color}
                            onClick={() => setEditValues({ ...editValues, [key]: color })}
                            className="w-6 h-6 border border-gray-600 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  ) : Array.isArray(value) ? (
                    <textarea
                      value={JSON.stringify(value, null, 2)}
                      onChange={(e) => {
                        try {
                          setEditValues({ ...editValues, [key]: JSON.parse(e.target.value) });
                        } catch {}
                      }}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
                      rows={3}
                    />
                  ) : typeof value === "object" && value !== null ? (
                    <textarea
                      value={JSON.stringify(value, null, 2)}
                      onChange={(e) => {
                        try {
                          setEditValues({ ...editValues, [key]: JSON.parse(e.target.value) });
                        } catch {}
                      }}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
                      rows={4}
                    />
                  ) : (
                    <input
                      type="text"
                      value={value?.toString() || ""}
                      onChange={(e) => setEditValues({ ...editValues, [key]: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Single component renderer ─────────────────────────────────────── */

function RenderComponent({
  entry,
  globalAccent,
  editMode,
  onPropertyChange,
  sectionId,
  componentIndex,
}: {
  entry: BlueprintComponent;
  globalAccent?: string;
  editMode?: boolean;
  onPropertyChange?: (sectionId: string, componentIndex: number, propPath: string, value: any) => void;
  sectionId: string;
  componentIndex: number;
}) {
  const reg = getRegistryEntry(entry.componentName);

  if (!reg) {
    return <FallbackComponent name={entry.componentName} />;
  }

  // Preserve box styling props before validation
  const boxBgColor = (entry.props as any).__boxBgColor;
  const boxBorderColor = (entry.props as any).__boxBorderColor;

  // Merge global accent if component didn't specify one
  const mergedProps = {
    ...(globalAccent && !entry.props.accentColor ? { accentColor: globalAccent } : {}),
    ...entry.props,
  };

  // Validate via Zod — use safeParse so bad data degrades gracefully
  const parsed = reg.propsSchema.safeParse(mergedProps);
  const validProps = parsed.success ? parsed.data : mergedProps;

  // Restore box styling props after validation
  if (boxBgColor || boxBorderColor) {
    (validProps as any).__boxBgColor = boxBgColor;
    (validProps as any).__boxBorderColor = boxBorderColor;
  }

  const renderedComponent = (
    <ComponentErrorBoundary name={entry.componentName}>
      {createElement(reg.component, validProps)}
    </ComponentErrorBoundary>
  );

  // Wrap in editable wrapper if in edit mode
  if (editMode && onPropertyChange) {
    return (
      <EditableWrapper
        componentName={entry.componentName}
        props={validProps}
        onEdit={(propPath, value) => onPropertyChange(sectionId, componentIndex, propPath, value)}
        sectionId={sectionId}
        componentIndex={componentIndex}
      >
        {renderedComponent}
      </EditableWrapper>
    );
  }

  // Apply saved box colors even when not in edit mode
  const savedBgColor = (validProps as any).__boxBgColor;
  const savedBorderColor = (validProps as any).__boxBorderColor;
  
  if (savedBgColor || savedBorderColor) {
    return (
      <div 
        className="p-4"
        style={{
          backgroundColor: savedBgColor || 'transparent',
          borderColor: savedBorderColor || 'transparent',
          borderWidth: savedBorderColor ? '1px' : '0',
          borderStyle: 'solid',
        }}
      >
        {renderedComponent}
      </div>
    );
  }

  return renderedComponent;
}

/* ── Section renderer ──────────────────────────────────────────────── */

function RenderSection({
  section,
  globalAccent,
  editMode,
  onPropertyChange,
}: {
  section: BlueprintSection;
  globalAccent?: string;
  editMode?: boolean;
  onPropertyChange?: (sectionId: string, componentIndex: number, propPath: string, value: any) => void;
}) {
  return (
    <div className="animate-fade-in" style={{ animationDelay: "0.05s" }}>
      {section.heading && (
        <h2 className="text-xl font-bold text-white mb-4">{section.heading}</h2>
      )}
      <div className="space-y-5">
        {section.components.map((comp, i) => (
          <RenderComponent
            key={`${section.id}-${i}`}
            entry={comp}
            globalAccent={globalAccent}
            editMode={editMode}
            onPropertyChange={onPropertyChange}
            sectionId={section.id}
            componentIndex={i}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Main renderer ─────────────────────────────────────────────────── */

export default function BlueprintRenderer({ blueprint, editMode, onPropertyChange }: BlueprintRendererProps) {
  const accent = blueprint.styleHints?.accentColor;

  const gap =
    blueprint.styleHints?.density === "compact"
      ? "gap-4"
      : blueprint.styleHints?.density === "spacious"
        ? "gap-10"
        : "gap-6";

  return (
    <div className={`flex flex-col ${gap} w-full`}>
      {blueprint.sections.map((section) => (
        <RenderSection
          key={section.id}
          section={section}
          globalAccent={accent}
          editMode={editMode}
          onPropertyChange={onPropertyChange}
        />
      ))}
    </div>
  );
}
