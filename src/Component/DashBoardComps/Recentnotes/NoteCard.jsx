import React, { memo, useMemo, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { DotsThreeVertical } from "@phosphor-icons/react";
import { selectNoteById } from "../../../redux/NotesCreation/NotesCreationSlice.js";

import NoteCardSidebar from "./NoteCardParts/NoteCardSidebar.jsx";
import NoteCardFooter from "./NoteCardParts/NoteCardFooter.jsx";
import NoteCardMenu from "./NoteCardParts/NoteCardMenu.jsx";

const NoteCard = memo(({
    noteId,
    isGridView,
    openMenu,
    onToggleMenu,
    onToggleStar,
    onDelete,
    onClick
}) => {
    const note = useSelector((state) => selectNoteById(state, noteId));

    const cleanContent = useMemo(() => {
        return note?.notes_contect
            ? note.notes_contect.replace(/<[^>]+>/g, "").trim()
            : "No content";
    }, [note?.notes_contect]);

    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openMenu &&
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)) {

                onToggleMenu(note.$id);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openMenu, onToggleMenu, note?.$id]);

    const spanClass = useMemo(() => {
        if (!isGridView) return "";
        const titleLength = (note?.notes_title || "").length;
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
            className={`relative flex flex-row bg-card hover:bg-muted/40 border border-border rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden group shadow-md ${isGridView
                ? `h-56 ${spanClass}`
                : "h-auto min-h-fit"
                }`}
        >
            {/* 1. Left Sidebar Column */}
            <NoteCardSidebar note={note} />

            {/* 2. Right Content Column */}
            <div className="flex-1 p-5 flex flex-col justify-between min-w-0 relative z-10">
                {/* Title and Action Menu */}
                <div className="flex justify-between items-start gap-4">
                    <h3 className="text-foreground text-base md:text-lg font-bold leading-tight line-clamp-1 pr-2 flex-1 group-hover:text-[#b49cf8] transition-colors duration-200">
                        {note.notes_title || "Untitled Note"}
                    </h3>

                    <button
                        ref={buttonRef}
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
                <div className="w-full bg-border my-3" />

                {/* Snippet Description */}
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed line-clamp-3 md:line-clamp-4 flex-1">
                    {cleanContent}
                </p>

                {/* Toolbar Footer Actions */}
                <NoteCardFooter
                    note={note}
                    onToggleStar={onToggleStar}
                    cleanContent={cleanContent}
                />
            </div>

            {/* Dropdown Menu (Absolute overlay) */}
            <NoteCardMenu
                openMenu={openMenu}
                menuRef={menuRef}
                onClick={onClick}
                onDelete={onDelete}
                note={note}
            />
        </div>
    );
});

export default NoteCard;