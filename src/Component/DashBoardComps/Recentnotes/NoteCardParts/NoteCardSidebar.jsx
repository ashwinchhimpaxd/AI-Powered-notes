import React, { memo, useMemo } from "react";
import { FileText } from "@phosphor-icons/react";
import RelativeTime from "./RelativeTime";

const NoteCardSidebar = memo(({ note }) => {
    const formattedCreatedDate = useMemo(() => {
        if (!note?.$createdAt) return null;
        return new Date(note.$createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }, [note?.$createdAt]);

    if (!note) return null;

    return (
        <div className="shrink-0 w-32 md:w-40 bg-background p-4 flex flex-col justify-between gap-4 border-r border-border relative z-10">
            <div className="flex flex-col gap-4">
                {/* ID Indicator */}
                <div className="flex items-center gap-1.5 text-foreground/80 font-bold text-[10px] md:text-xs tracking-wider">
                    <FileText size={16} weight="fill" className="text-[#b49cf8]" />
                    <span>ID-{note.$id?.slice(-4).toUpperCase()}</span>
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
                            <RelativeTime updatedAt={note.$updatedAt} />
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
    );
});

export default NoteCardSidebar;
