import React, { memo, useCallback } from "react";
import { useExportPDF } from '../../.././Editor/Components/DropDownMenu/Hooks/useExportPDF.jsx';

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

const NoteCardMenu = memo(({ openMenu, menuRef, onClick, onDelete, note }) => {
    const { exportToPDF } = useExportPDF();

    const handleExportPDF = useCallback(async (e, noteItem) => {
        e.stopPropagation();
        const content = noteItem.notes_contect || '';
        const stripped = content.replace(/<[^>]+>/g, '').trim();
        if (!stripped) {
            const mod = await import("../../../Editor/utils/showToast.js");
            mod.showToast("warning", "Note is empty to make PDF");
            return;
        }
        const json = htmlToTiptap(content);
        await exportToPDF(json, noteItem.notes_title || "Untitled Note");
    }, [exportToPDF]);

    if (!openMenu) return null;

    return (
        <div ref={menuRef} className="absolute top-12 right-4 w-32 bg-card/95 backdrop-blur-2xl border border-border rounded-xl shadow-2xl z-100 flex flex-col py-1 animate-in fade-in slide-in-from-top-2 duration-150">
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
    );
});

export default NoteCardMenu;
