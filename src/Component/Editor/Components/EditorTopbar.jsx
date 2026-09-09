import React, { memo, useState, useEffect, useRef } from "react";
import { Sparkle, FloppyDisk, CircleNotch, ChatTeardropText } from "@phosphor-icons/react";
import { CustomDropdown } from "./DropDownMenu/DrowdownmenuWrapper";
// import TestAiAppwriteSDK from "../../Testing-components/TestAiAppwriteSDK" // file does not exist — kept for reference only
/**
 * Fixed top bar: title (click-to-edit), summary, export, and save buttons.
 *
 * @param {object}   props
 * @param {string}   props.title
 * @param {function} props.setTitle
 * @param {function} props.commitTitle
 * @param {boolean}  props.isSaving
 * @param {boolean}  props.isNoteSaved
 * @param {function} props.onSave
 * @param {function} props.onSummary
 */
const EditorTopbar = memo(function EditorTopbar({ title, setTitle, commitTitle, isSaving, isNoteSaved, onSave, onSummary, onAiChat, editor }) {

  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleScroll = (event) => {
      const target = event.target;
      if (!target) return;

      // ── Ignore scrolls inside the slash command menu ──────────────────
      // SlashCommandMenu's list div has data-slash-menu attribute.
      // capture:true catches all scroll events, so we must explicitly skip
      // any event whose source is inside that menu to avoid hiding the toolbar.
      if (target instanceof Element && target.closest("[data-slash-menu]")) return;

      // Determine scroll position based on scroll target (window vs custom scrollable elements)
      const currentScrollY = target === document
        ? (window.scrollY || document.documentElement.scrollTop)
        : (target.scrollTop || 0);

      // Prevent bounce scroll issues on mobile/Mac from hiding the navbar
      if (currentScrollY < 0) {
        setIsVisible(true);
        return;
      }

      // Check if we have scrolled past a minimum threshold to avoid flickering
      const scrollDiff = currentScrollY - lastScrollY.current;
      if (Math.abs(scrollDiff) < 10) return;

      if (currentScrollY > lastScrollY.current && currentScrollY > 30) {
        // Scrolling down & scrolled past navbar height -> hide
        setIsVisible(false);
      } else {
        // Scrolling up -> show
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    // Use capture phase (true) because scroll events do not bubble
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 pt-1  transition-transform duration-300 ease-in-out  "
      style={{
        transform: isVisible ? "translateY(0)" : "translateY(-100%)"
      }}
    >
      {/* Title */}
      <div className="flex items-center gap-3 flex-1 min-w-0 mr-6">

        {!isEditing && title.trim().length > 0 ? (
          <h2
            onClick={() => setIsEditing(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsEditing(true);
              }
            }}
            role="button"
            tabIndex={0}
            className="text-lg font-semibold text-foreground/90 cursor-text truncate hover:text-foreground transition-colors wrap-none"
            title="Click to edit title"
            aria-label="Edit title"
          >
            {title}
          </h2>
        ) : (
          <input
            ref={inputRef}
            type="text"
            placeholder="Untitled Note…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              commitTitle(title);
              if (title.trim().length > 0) setIsEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                commitTitle(title);
                if (title.trim().length > 0) setIsEditing(false);
              }
            }}
            className="text-lg font-semibold bg-transparent text-foreground border-b border-purple-500/60 outline-none placeholder-foreground/30 w-[stretch] max-w-[50%]"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center h-fit gap-2 shrink-0  relative">

        <div className="flex gap-2 flex-1  ">
          {/* ai chat button  */}
          <button
            type="button"
            onClick={() => onAiChat(pre => !pre)}
            className="flex items-center justify-center gap-1 p-2 border border-border rounded-xl bg-[#e6b1e9] text-chart-4 hover:bg-[#f28bf8] transition-colors text-xs font-semibold cursor-pointer h-full">
            <ChatTeardropText weight="fill" size={14} />
            <p className="lg:block hidden">ASK Ai</p>
          </button>
          {/* Summary */}
          <button
            type="button"
            onClick={onSummary}
            className="flex items-center gap-1 p-2 rounded-full bg-card/50 border border-border text-foreground/80 hover:bg-muted hover:text-foreground backdrop-blur-md transition-all text-sm cursor-pointer  h-full"
          >
            <Sparkle weight="fill" size={14} className="text-purple-400" />
            <p className="lg:block hidden">Summary</p>
          </button>
        </div>
        {/* Save */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || isNoteSaved}
          className={`flex lg:w-25 justify-center   items-center gap-1 p-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${isNoteSaved
            ? "bg-card/55 border-border text-foreground/45 cursor-default"
            : "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:border-primary/90 shadow-lg"
            }`}
        >
          {isSaving
            ? <><CircleNotch className="animate-spin" size={14} /> <p className="lg:block hidden">Saving…</p></>
            : isNoteSaved
              ? <><FloppyDisk size={14} /> <p className="lg:block hidden">Saved</p></>
              : <><FloppyDisk size={14} /> <p className="lg:block hidden">Save</p></>
          }
        </button>
      </div>
      {/* drop down list actions */}
      <CustomDropdown editor={editor} />
      {/* <TestAiAppwriteSDK />   this is for texting UI   */}
    </div >
  );
});
export default EditorTopbar;
