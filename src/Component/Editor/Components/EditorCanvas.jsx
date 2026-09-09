import React, { memo } from "react";
import { EditorContent } from "@tiptap/react";
import BubbleToolbar from "./BubbleToolbar.jsx";

/**
 * The writing canvas: renders the BubbleMenu and EditorContent.
 * Kept intentionally minimal — all logic lives in hooks.
 */
const EditorCanvas = memo(function EditorCanvas({ editor }) {
  if (!editor) return null;

  return (
    <div className="md:w-[70vw] w-screen mt-24 mb-40 px-4 z-10 ">
      <BubbleToolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="w-full text-[1.3rem] text-foreground/85 antialiased z-10! pb-10 "
      />
    </div>
  );
});

export default EditorCanvas;
