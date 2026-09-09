import React, { memo } from "react";
import { Sparkle, X } from "@phosphor-icons/react";

/**
 * Floating slash-command palette.
 *
 * @param {object}   props
 * @param {boolean}  props.open            - whether the menu is visible
 * @param {{ top: number, left: number }} props.coords - position
 * @param {string}   props.query           - current filter query
 * @param {Array}    props.commands        - already-filtered command array
 * @param {function} props.onSelect        - called with (cmd) when a command is clicked
 * @param {function} props.onClose         - called when the X is clicked
 */
const SlashCommandMenu = memo(function SlashCommandMenu({ open, coords, query, commands, onSelect, onClose}) {

  if (!open) return null;

  return (
    <div
      className="fixed z-200 w-80 bg-card/97 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      style={{ top: coords.top, left: coords.left }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border shrink-0">
        <Sparkle size={12} className="text-purple-400 shrink-0" />
        <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest flex-1">
          {query ? `"${query}"` : "AI Commands — type to filter"}
        </span>
        <button
          type="button" 
          onMouseDown={(e) => { e.preventDefault(); onClose(); }}
          className="text-muted-foreground/40 hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close menu"
        >
          <X size={12} />
        </button>
      </div>

      {/* List */}
      <div data-slash-menu className="max-h-90 overflow-y-auto p-1.5 flex flex-col gap-0.5">
        {commands.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground/40">
            No commands match &quot;{query}&quot;
          </div>
        ) : (
          commands.map((cmd) => (
            <button
              type="button"
              key={cmd.id}
              onMouseDown={(e) => { e.preventDefault(); onSelect(cmd); }}
              className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-muted text-left transition-all group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-purple-400/80 group-hover:text-purple-300 group-hover:bg-purple-500/10 transition-colors text-sm shrink-0">
                {cmd.icon}
              </div>
              <div>
                <div className="text-sm font-medium text-foreground/90 group-hover:text-foreground">{cmd.label}</div>
                <div className="text-[11px] text-muted-foreground/60">{cmd.description}</div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
});

export default SlashCommandMenu;
