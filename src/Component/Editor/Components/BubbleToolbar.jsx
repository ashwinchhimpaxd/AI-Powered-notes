import React, { memo } from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  TextB, TextItalic, TextUnderline, TextHOne, TextHTwo,
  ListBullets, ListNumbers, Highlighter, Quotes,
  LinkSimple,
  TextAlignLeft, TextAlignCenter, TextAlignRight, TextAlignJustify,
} from "@phosphor-icons/react";
import FormatButton from "./FormatButton.jsx";

// ... extensions: [StarterKit, Highlight, Blockquote, ...]

/**
 * Glassmorphism bubble toolbar that appears on text selection.
 */
const BubbleToolbar = memo(function BubbleToolbar({ editor }) {
  if (!editor) return null;

  const handleLinkClick = () => {
    const url = window.prompt("Enter URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        placement: "top",
        appendTo: document.body,
        zIndex: 9999,
        popperOptions: {
          modifiers: [
            {
              name: "preventOverflow",
              options: {
                boundary: "viewport",
                padding: { top: 90, bottom: 10, left: 10, right: 10 },
              },
            },
            {
              name: "flip",
              options: {
                boundary: "viewport",
                padding: { top: 90, bottom: 10, left: 10, right: 10 },
              },
            },
          ],
        },
      }}
      className="flex items-center gap-0.5 p-1.5 rounded-2xl bg-card/90 backdrop-blur-2xl border border-border shadow-2xl z-50">
      <FormatButton editor={editor} command="bold" icon={<TextB size={16} />} />
      <FormatButton editor={editor} command="italic" icon={<TextItalic size={16} />} />
      <FormatButton editor={editor} command="underline" icon={<TextUnderline size={16} />} />
      <div className="w-px h-4 bg-border mx-1" />
      <FormatButton editor={editor} command="heading" level={1} icon={<TextHOne size={16} />} />
      <FormatButton editor={editor} command="heading" level={2} icon={<TextHTwo size={16} />} />
      <div className="w-px h-4 bg-border mx-1" />
      <FormatButton editor={editor} align="left" icon={<TextAlignLeft size={16} />} />
      <FormatButton editor={editor} align="center" icon={<TextAlignCenter size={16} />} />
      <FormatButton editor={editor} align="right" icon={<TextAlignRight size={16} />} />
      <FormatButton editor={editor} align="justify" icon={<TextAlignJustify size={16} />} />
      <div className="w-px h-4 bg-border mx-1" />
      <FormatButton editor={editor} command="bulletList" icon={<ListBullets size={16} />} />
      <FormatButton editor={editor} command="orderedList" icon={<ListNumbers size={16} />} />
      <div className="w-px h-4 bg-border mx-1" />
      <FormatButton editor={editor} command="highlight" icon={<Highlighter size={16} />} />
      <FormatButton editor={editor} command="blockquote" icon={<Quotes size={16} />} />
      <FormatButton editor={editor} command="link" icon={<LinkSimple size={16} />} onClick={handleLinkClick} />
    </BubbleMenu>
  );
});

export default BubbleToolbar;
