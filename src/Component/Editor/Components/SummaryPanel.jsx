import React, { memo } from "react";
import { CircleNotch, Sparkle, Warning, X } from "@phosphor-icons/react";

/**
 * Sliding summary side panel.
 *
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {boolean}  props.loading
 * @param {object|null} props.data     - { overview, keyPoints, actionItems, tone }
 * @param {string|null} props.error
 * @param {function} props.onClose
 * @param {function} props.onGenerate  - called to (re-)generate summary
 */
const SummaryPanel = memo(function SummaryPanel({ open, loading, data, error, onClose, onGenerate }) {
  return (
    <div
      className={`fixed top-0 right-0 h-screen w-[380px] bg-card/98 backdrop-blur-3xl border-l border-border shadow-2xl z-[100] flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "translate-x-0" : "translate-x-full"
        }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-5 border-b border-border flex-shrink-0">
        <h2 className="text-base font-semibold flex items-center gap-2 text-foreground">
          <Sparkle weight="fill" className="text-purple-400" size={16} />
          Document Summary
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground/40 hover:text-foreground p-1.5 rounded-full hover:bg-muted transition-colors cursor-pointer"
          aria-label="Close summary"
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <CircleNotch size={28} className="animate-spin text-purple-400" />
            <span className="text-sm text-muted-foreground/60">Analyzing your note…</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
            <Warning size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-300">{error}</span>
          </div>
        )}

        {data && !loading && (
          <>
            <div className="p-4 rounded-2xl bg-muted/40 border border-border">
              <h3 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2">Overview</h3>
              <p className="text-sm text-foreground/85 leading-relaxed">{data.overview}</p>
            </div>

            {data.keyPoints?.length > 0 && (
              <div className="p-4 rounded-2xl bg-muted/40 border border-border">
                <h3 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-3">Key Points</h3>
                <ul className="space-y-2">
                  {data.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80 leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.actionItems?.length > 0 && (
              <div className="p-4 rounded-2xl bg-muted/40 border border-border">
                <h3 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-3">Action Items</h3>
                <ul className="space-y-2">
                  {data.actionItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80 leading-relaxed">
                      <span className="mt-0.5 w-4 h-4 rounded border border-border/30 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.tone && (
              <div className="px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 inline-flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">Tone</span>
                <span className="text-sm text-purple-600 dark:text-purple-300 font-medium">{data.tone}</span>
              </div>
            )}
          </>
        )}

        {!loading && !error && !data && (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
            <Sparkle size={28} className="text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground/40">Click &quot;Summary&quot; to analyze your note with AI.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && (
        <div className="px-6 py-4 border-t border-border flex-shrink-0">
          <button
            type="button"
            onClick={onGenerate}
            className="w-full py-2.5 rounded-xl bg-purple-600/10 dark:bg-purple-600/20 hover:bg-purple-600/20 dark:hover:bg-purple-600/30 border border-purple-500/20 text-purple-600 dark:text-purple-300 text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkle weight="fill" size={14} />
            {data ? "Re-generate" : "Generate Summary"}
          </button>
        </div>
      )}
    </div>
  );
});

export default SummaryPanel;
