import { memo, useMemo, useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { FileText, Bookmark, ShareNetwork, DotsThreeVertical } from "@phosphor-icons/react";
import { selectNoteById } from "../../../redux/NotesCreation/NotesCreationSlice.js";
import { useExportPDF } from '../../Editor/Components/DropDownMenu/Hooks/useExportPDF.jsx';


// note ko pdf me convert karne ke liye 
const htmlToTiptap = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const walk = (parent) => {
        const nodes = [];
        for (const child of parent.childNodes) {
            if (child.nodeType === 3) {
                if (child.textContent.trim()) nodes.push({ type: 'text', text: child.textContent });
            } else if (child.nodeType === 1) {
                const tag = child.tagName.toLowerCase();
                const content = walk(child);
                const m = (t) => { const marks = []; if (['strong', 'b'].includes(t)) marks.push({ type: 'bold' }); if (['em', 'i'].includes(t)) marks.push({ type: 'italic' }); if (t === 'u') marks.push({ type: 'underline' }); return marks; };
                if (['strong', 'b', 'em', 'i', 'u'].includes(tag)) {
                    const text = child.textContent.trim();
                    if (text) nodes.push({ type: 'text', text, marks: m(tag) });
                } else if (tag === 'p') nodes.push({ type: 'paragraph', content });
                else if (tag.match(/^h[2-3]$/)) nodes.push({ type: 'heading', attrs: { level: +tag[1] }, content });
                else if (tag === 'ul') nodes.push({ type: 'bulletList', content });
                else if (tag === 'ol') nodes.push({ type: 'orderedList', content });
                else if (tag === 'li') nodes.push({ type: 'listItem', content });
                else if (tag === 'blockquote') nodes.push({ type: 'blockquote', content });
                else if (tag === 'hr') nodes.push({ type: 'horizontalRule' });
                else if (tag === 'img') nodes.push({ type: 'image', attrs: { src: child.getAttribute('src') || '' } });
                else if (tag === 'br') nodes.push({ type: 'text', text: '\n' });
                else if (content?.length) nodes.push(...content);
            }
        }
        return nodes.length ? nodes : undefined;
    };
    return walk(doc.body) || [];
};

const NoteCard = memo(({
    noteId,
    isGridView,
    openMenu,
    onToggleMenu,
    onToggleStar,
    onDelete,
    onClick
}) => {

    const { exportToPDF } = useExportPDF();
    const note = useSelector((state) => selectNoteById(state, noteId));

    const handleExportPDF = useCallback(async (e, noteItem) => {
        e.stopPropagation();
        const content = noteItem.notes_contect || '';
        const stripped = content.replace(/<[^>]+>/g, '').trim();
        if (!stripped) {
            const mod = await import("../../Editor/utils/showToast.js");
            mod.showToast("warning", "Note is empty to make PDF");
            return;
        }
        const json = htmlToTiptap(content);
        await exportToPDF(json, noteItem.notes_title || "Untitled Note");
    }, [exportToPDF]);

    // Premium Date Formatter for Creation Date
    const formattedCreatedDate = useMemo(() => {
        if (!note) return null;
        return new Date(note.$createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }, [note]);

    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 60000); // Tick every 60 seconds (1 minute)
        return () => clearInterval(interval);
    }, []);

    // Premium Relative/Date Formatter for Modification Date
    const relativeModified = useMemo(() => {
        if (!note) return "";
        const diffMs = now - new Date(note.$updatedAt);
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return "Just now";
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffHrs = Math.floor(diffMin / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        return new Date(note.$updatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }, [note, now]);

    const cleanContent = useMemo(() => {
        return note?.notes_contect
            ? note.notes_contect.replace(/<[^>]+>/g, "").trim()
            : "No content";
    }, [note?.notes_contect]);

    const spanClass = useMemo(() => {
        if (!isGridView) return "";
        const titleLength = (note.notes_title || "").length;
        const contentLength = cleanContent.length;

        // Dynamic width spanning: longer content gets col-span-2 on medium/large screens
        if (titleLength > 30 || contentLength > 120) {
            return "md:col-span-2 lg:col-span-2";
        }
        return "col-span-1";
    }, [isGridView, note?.notes_title, cleanContent]);

    if (!note) return null;
    return (
        <div
            onClick={() => onClick(note)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick(note);
                }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Open note: ${note.notes_title || "Untitled"}`}
            className={`relative  flex flex-row bg-card hover:bg-muted/40 border border-border rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden group shadow-md ${isGridView
                ? `h-56 ${spanClass}`
                : "h-auto min-h-fit"
                }`}
        >
            {/* 1. Left Sidebar Column */}
            <div className="flex-shrink-0 w-32 md:w-40 bg-background p-4 flex flex-col justify-between  gap-4 border-r border-border relative z-10">
                <div className="flex flex-col gap-4 ">
                    {/* ID Indicator */}
                    <div className="flex items-center gap-1.5 text-foreground/80 font-bold text-[10px] md:text-xs tracking-wider">
                        <FileText size={16} weight="fill" className="text-[#b49cf8]" />
                        <span>ID-{note.$id.slice(-4).toUpperCase()}</span>
                    </div>

                    {/* Metadata Dates */}
                    <div className="flex flex-col gap-3.5">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest">
                                Created
                            </span>
                            <span className="text-xs font-medium text-muted-foreground">
                                {formattedCreatedDate}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest">
                                Modified
                            </span>
                            <span className="text-xs font-medium text-purple-600 dark:text-[#b49cf8] animate-pulse-subtle">
                                {relativeModified}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Badge (Bottom Left) */}
                <span className={`self-start px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-widest rounded-md border ${note.is_note_important
                    ? "bg-amber-500/10 dark:bg-yellow-500/5 border-amber-500/20 dark:border-yellow-500/20 text-amber-700 dark:text-yellow-400/90 shadow-md shadow-yellow-500/5"
                    : "bg-muted border-border text-muted-foreground/60"
                    }`}>
                    {note.is_note_important ? "Important" : (note.category || note.type || "General")}
                </span>
            </div>

            {/* 2. Right Content Column */}
            <div className="flex-1 p-5 flex flex-col justify-between min-w-0 relative z-10">
                {/* Title and Action Menu */}
                <div className="flex justify-between items-start gap-4">
                    <h3 className="text-foreground text-base md:text-lg font-bold leading-tight line-clamp-1 pr-2 flex-1 group-hover:text-[#b49cf8] transition-colors duration-200">
                        {note.notes_title || "Untitled Note"}
                    </h3>

                    <button
                        type="button"
                        className="p-1 rounded-md bg-muted text-muted-foreground/60 hover:text-foreground transition-colors relative z-20 cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleMenu(note.$id);
                        }}
                        aria-label={`Open menu for note ${note.notes_title || "Untitled"}`}
                    >
                        <DotsThreeVertical size={18} weight="bold" />
                    </button>
                </div>

                {/* Horizontal Divider */}
                <div className="w-full h-[1px] bg-border my-3" />

                {/* Snippet Description */}
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed line-clamp-3 md:line-clamp-4 flex-1">
                    {cleanContent}
                </p>

                {/* Toolbar Footer Actions */}
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
                        aria-label={note.is_note_important ? `Unbookmark note ${note.notes_title || "Untitled"}` : `Bookmark note ${note.notes_title || "Untitled"}`}
                    >
                        <Bookmark size={14} weight={note.is_note_important ? "fill" : "regular"} />
                        <span>{note.is_note_important ? "Bookmarked" : "Save"}</span>
                    </button>

                    {/* Share Action */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!note.slug) {
                                import("../../Editor/utils/showToast.js").then((module) => {
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
                                        import("../../Editor/utils/showToast.js").then((module) => {
                                            module.showToast("success", "Link copied to clipboard!");
                                        });
                                    })
                                    .catch(() => {
                                        import("../../Editor/utils/showToast.js").then((module) => {
                                            module.showToast("error", "Failed to copy link.");
                                        });
                                    });
                            }
                        }}
                        className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase text-muted-foreground hover:text-foreground transition-colors relative z-20 cursor-pointer"
                        aria-label={`Share note ${note.notes_title || "Untitled"}`}
                    >
                        <ShareNetwork size={14} />
                        <span>Share</span>
                    </button>
                </div>
            </div>

            {/* Dropdown Menu (Absolute overlay) */}
            {openMenu && (
                <div className="absolute top-12 right-4 w-32 bg-card/95 backdrop-blur-2xl border border-border rounded-xl shadow-2xl z-[100] flex flex-col py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                        type="button"
                        onClick={() => onClick(note)}
                        className="px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted hover:text-foreground text-left transition-colors cursor-pointer"
                    >
                        Open Editor
                    </button>
                    <button
                        type="button"
                        onClick={(e) => handleExportPDF(e, note)}
                        className="px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted hover:text-foreground text-left transition-colors cursor-pointer"
                    >
                        Export as Pdf
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 text-left transition-colors cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(note.$id);
                        }}
                    >
                        Delete Note
                    </button>
                </div>
            )}
        </div>
    );
});

export default NoteCard;