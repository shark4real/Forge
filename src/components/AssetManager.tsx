/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Asset Manager
 *
 * Upload and manage images, logos, color palettes, and design references.
 * Assets can be:
 *   • Dragged & dropped or file-picked
 *   • Tagged for organization
 *   • Referenced in blueprints (future)
 *   • Previewed in a lightbox
 * ════════════════════════════════════════════════════════════════════════
 */

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Image,
  Trash2,
  Tag,
  X,
  Search,
  Grid3X3,
  List,
  FileImage,
  Download,
  Eye,
  Plus,
} from "lucide-react";
import { nanoid } from "nanoid";
import { useForge, type UploadedAsset } from "../lib/forgeState";

/* ── Helpers ───────────────────────────────────────────────────────── */

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ── Lightbox ──────────────────────────────────────────────────────── */

function Lightbox({ asset, onClose }: { asset: UploadedAsset; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[80vh] rounded-xl overflow-hidden bg-gray-900 border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
          <div>
            <p className="text-sm font-semibold text-white">{asset.name}</p>
            <p className="text-[10px] text-gray-500">
              {asset.type} · {formatBytes(asset.size)}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-800 text-gray-400">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 flex items-center justify-center bg-[repeating-conic-gradient(#1f2937_0%_25%,transparent_0%_50%)] bg-[length:20px_20px]">
          <img
            src={asset.dataUrl}
            alt={asset.name}
            className="max-w-full max-h-[60vh] object-contain rounded"
          />
        </div>
        {asset.tags.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-800 flex items-center gap-1.5">
            <Tag size={12} className="text-gray-500" />
            {asset.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Asset card ────────────────────────────────────────────────────── */

function AssetCard({
  asset,
  viewMode,
  onPreview,
  onDelete,
  onAddTag,
}: {
  asset: UploadedAsset;
  viewMode: "grid" | "list";
  onPreview: () => void;
  onDelete: () => void;
  onAddTag: (tag: string) => void;
}) {
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagValue, setTagValue] = useState("");
  const isImage = asset.type.startsWith("image/");

  function handleTagSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = tagValue.trim();
    if (trimmed) {
      onAddTag(trimmed);
      setTagValue("");
      setShowTagInput(false);
    }
  }

  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/60 border border-gray-800/50 hover:border-gray-700 transition-colors group">
        {/* Thumbnail */}
        <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700/50 overflow-hidden shrink-0 flex items-center justify-center">
          {isImage ? (
            <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-cover" />
          ) : (
            <FileImage size={16} className="text-gray-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-white truncate">{asset.name}</p>
          <p className="text-[10px] text-gray-500">
            {formatBytes(asset.size)} · {new Date(asset.createdAt).toLocaleDateString()}
          </p>
        </div>

        {asset.tags.length > 0 && (
          <div className="flex gap-1 shrink-0">
            {asset.tags.map((tag) => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={onPreview} className="p-1 rounded text-gray-500 hover:text-white hover:bg-gray-800">
            <Eye size={14} />
          </button>
          <button
            onClick={() => setShowTagInput(true)}
            className="p-1 rounded text-gray-500 hover:text-white hover:bg-gray-800"
          >
            <Tag size={14} />
          </button>
          <button onClick={onDelete} className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-gray-800">
            <Trash2 size={14} />
          </button>
        </div>

        {showTagInput && (
          <form onSubmit={handleTagSubmit} className="flex items-center gap-1">
            <input
              autoFocus
              value={tagValue}
              onChange={(e) => setTagValue(e.target.value)}
              onBlur={() => setShowTagInput(false)}
              placeholder="tag…"
              className="w-20 px-1.5 py-0.5 text-[10px] bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-indigo-500"
            />
          </form>
        )}
      </div>
    );
  }

  // Grid view
  return (
    <div className="rounded-xl bg-gray-900/60 border border-gray-800/50 hover:border-gray-700 transition-colors group overflow-hidden">
      {/* Preview area */}
      <button
        onClick={onPreview}
        className="w-full aspect-square bg-[repeating-conic-gradient(#1f2937_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] flex items-center justify-center overflow-hidden"
      >
        {isImage ? (
          <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-cover" />
        ) : (
          <FileImage size={32} className="text-gray-600" />
        )}
      </button>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-xs text-white truncate font-medium">{asset.name}</p>
        <p className="text-[10px] text-gray-500 mt-0.5">{formatBytes(asset.size)}</p>

        {asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {asset.tags.map((tag) => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowTagInput(true)}
            className="p-1 rounded text-gray-500 hover:text-white hover:bg-gray-800 text-[10px]"
            title="Add tag"
          >
            <Tag size={12} />
          </button>
          <button onClick={onDelete} className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-gray-800" title="Delete">
            <Trash2 size={12} />
          </button>
        </div>

        {showTagInput && (
          <form onSubmit={handleTagSubmit} className="mt-1.5">
            <input
              autoFocus
              value={tagValue}
              onChange={(e) => setTagValue(e.target.value)}
              onBlur={() => setShowTagInput(false)}
              placeholder="tag name…"
              className="w-full px-2 py-1 text-[10px] bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-indigo-500"
            />
          </form>
        )}
      </div>
    </div>
  );
}

/* ── Main Asset Manager ────────────────────────────────────────────── */

export default function AssetManager() {
  const { assets, dispatch } = useForge();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [lightboxAsset, setLightboxAsset] = useState<UploadedAsset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredAssets = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
  );

  const handleFiles = useCallback(
    async (files: FileList) => {
      for (const file of Array.from(files)) {
        const dataUrl = await fileToDataUrl(file);
        const asset: UploadedAsset = {
          id: nanoid(8),
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
          createdAt: new Date().toISOString(),
          tags: [],
        };
        dispatch({ type: "ADD_ASSET", asset });
      }
    },
    [dispatch],
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  }

  function handleAddTag(assetId: string, tag: string) {
    const asset = assets.find((a) => a.id === assetId);
    if (asset && !asset.tags.includes(tag)) {
      dispatch({ type: "TAG_ASSET", id: assetId, tags: [...asset.tags, tag] });
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-950/50">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-900/80 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Image size={20} className="text-pink-400" />
              Assets
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Upload images, logos, and design references
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/30 hover:bg-pink-500/30 transition-colors"
            >
              <Upload size={12} />
              Upload
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.svg,.pdf"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      {assets.length > 0 && (
        <div className="px-6 py-2 border-b border-gray-800/50 flex items-center gap-2 shrink-0">
          <div className="flex-1 flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-1.5 border border-gray-700/50">
            <Search size={14} className="text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets…"
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-0.5 bg-gray-800/60 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded ${viewMode === "grid" ? "bg-gray-700 text-white" : "text-gray-500"}`}
            >
              <Grid3X3 size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded ${viewMode === "list" ? "bg-gray-700 text-white" : "text-gray-500"}`}
            >
              <List size={14} />
            </button>
          </div>
          <span className="text-[10px] text-gray-600">{filteredAssets.length} files</span>
        </div>
      )}

      {/* ── Assets area ─────────────────────────────────────────────── */}
      <div
        className={`flex-1 overflow-y-auto p-6 transition-colors ${dragOver ? "bg-pink-500/5 ring-2 ring-inset ring-pink-500/30" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className={`w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center mb-4 transition-colors
                ${dragOver ? "border-pink-500/50 bg-pink-500/10" : "border-gray-700 bg-gray-900/40"}`}
            >
              <Upload size={32} className={dragOver ? "text-pink-400" : "text-gray-600"} />
            </div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">
              {dragOver ? "Drop files here" : "Upload your design assets"}
            </h3>
            <p className="text-xs text-gray-600 max-w-sm mb-4">
              Drag & drop images, logos, screenshots, or mockups. These will be available
              as references for your AI-generated app.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 text-xs rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/30 hover:bg-pink-500/30 transition-colors"
            >
              <Plus size={14} />
              Choose files
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {/* Drop zone card */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-xl border-2 border-dashed aspect-square flex flex-col items-center justify-center gap-2 transition-colors
                ${dragOver ? "border-pink-500/50 bg-pink-500/10" : "border-gray-800 hover:border-gray-700 bg-gray-900/30"}`}
            >
              <Upload size={20} className="text-gray-600" />
              <span className="text-[10px] text-gray-600">Add files</span>
            </button>
            {filteredAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                viewMode="grid"
                onPreview={() => setLightboxAsset(asset)}
                onDelete={() => dispatch({ type: "REMOVE_ASSET", id: asset.id })}
                onAddTag={(tag) => handleAddTag(asset.id, tag)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                viewMode="list"
                onPreview={() => setLightboxAsset(asset)}
                onDelete={() => dispatch({ type: "REMOVE_ASSET", id: asset.id })}
                onAddTag={(tag) => handleAddTag(asset.id, tag)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ────────────────────────────────────────────────── */}
      {lightboxAsset && (
        <Lightbox asset={lightboxAsset} onClose={() => setLightboxAsset(null)} />
      )}
    </div>
  );
}
