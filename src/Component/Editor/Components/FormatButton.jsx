import React, { memo } from "react";

/**
 * A single formatting button for the BubbleMenu toolbar.
 * Uses onMouseDown + preventDefault so the editor doesn't lose focus.
 */
const FormatButton = memo(function FormatButton({ editor, command, icon, level, align, onClick }) {
  // Mapping for commands that don't follow the simple "toggleX" pattern
  const commandMap = {
    highlight: "toggleHighlight",
    blockquote: "toggleBlockquote",
    bulletList: "toggleBulletList",
    orderedList: "toggleOrderedList",
    bold: "toggleBold",
    italic: "toggleItalic",
    underline: "toggleUnderline",
    link: "setLink" // Link ka scene alag hota hai
  };

  let isActive = false;
  if (align) {
    isActive = editor.isActive({ textAlign: align });
  } else if (level) {
    isActive = editor.isActive(command, { level });
  } else {
    isActive = editor.isActive(command);
  }

  const handleClick = () => {
    if (onClick) return onClick();

    if (align) {
      editor.chain().focus().setTextAlign(align).run();
      return;
    }

    if (level) {
      editor.chain().focus().toggleHeading({ level }).run();
      return;
    }

    // Command select karo
    const method = commandMap[command] || `toggle${command.charAt(0).toUpperCase() + command.slice(1)}`;

    // Command execute karo
    if (editor.chain().focus()[method]) {
      editor.chain().focus()[method]().run();
    }
  };

  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        handleClick();
      }}
      className={`p-2 rounded-xl transition-all duration-150 ${isActive
        ? "hover:bg-foreground/10 text-foreground"
        : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
        }`}
    >
      {icon}
    </button>
  );
});

export default FormatButton;
