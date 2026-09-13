import React, { memo } from "react";
import { Bookmark, ShareNetwork } from "@phosphor-icons/react";

const NoteCardFooter = memo(({ note, onToggleStar, cleanContent }) => {
    return (
        <div className="flex items-center gap-4 pt-3 border-t border-border mt-2">
            {/* Toggle Star/Save Action */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(e, note);
                }}
                className={`flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase transition-colors relative z-20 cursor-pointer ${note.is_note_important
                    ? "text-amber-600 dark:text-yellow-400 hover:text-amber-700 dark:hover:text-yellow-500"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                aria-label={note.is_note_important ? `Unbookmark note ${note?.notes_title || "Untitled"}` : `Bookmark note ${note?.notes_title || "Untitled"}`}
            >
                <Bookmark size={14} weight={note.is_note_important ? "fill" : "regular"} />
                <span>{note.is_note_important ? "Saved" : "Save"}</span>
            </button>

            {/* Share Action */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    if (!note.slug) {
                        import("../../../Editor/utils/showToast.js").then((module) => {
                            module.showToast("warning", "Cannot share a note without a slug!");
                        });
                        return;
                    }
                    const noteUrl = window.location.origin + `/Dashboard/editor/${note.slug}`;
                    // Trigger smooth native navigator share or copy link
                    if (navigator.share) {
                        navigator.share({
                            title: note.notes_title || "Untitled Note",
                            text: cleanContent || "",
                            url: noteUrl
                        }).catch(() => { });
                    } else {
                        navigator.clipboard.writeText(noteUrl)
                            .then(() => {
                                import("../../../Editor/utils/showToast.js").then((module) => {
                                    module.showToast("success", "Link copied to clipboard!");
                                });
                            })
                            .catch(() => {
                                import("../../../Editor/utils/showToast.js").then((module) => {
                                    module.showToast("error", "Failed to copy link.");
                                });
                            });
                    }
                }}
                className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase text-muted-foreground hover:text-foreground transition-colors relative z-20 cursor-pointer"
                aria-label={`Share note ${note?.notes_title || "Untitled"}`}
            >
                <ShareNetwork size={14} />
                <span>Share</span>
            </button>
        </div>
    );
});

export default NoteCardFooter;
