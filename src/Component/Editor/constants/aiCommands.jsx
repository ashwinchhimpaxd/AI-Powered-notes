import React from "react";
import {
  Sparkle, MagicWand, TextAa, CaretRight, Textbox,
  LinkSimple, ChatTeardropText, List, ListBullets,
  TextB, Quotes, TextHOne,
} from "@phosphor-icons/react";

/**
 * mode: "replace" → AI output REPLACES the entire note content (old text is removed)
 * mode: "append"  → AI output is INSERTED after the current cursor position
 */
export const AI_COMMANDS = [
  // ── REPLACE commands (edit / transform existing content) ───────────────
  {
    id: "improve",
    mode: "replace",
    icon: <Sparkle weight="fill" />,
    label: "Improve Writing",
    description: "Enhance clarity, readability, and flow while preserving the original meaning, structure, headings, lists, formatting, and key information.",
    task: "editStandard"
  },
  {
    id: "rewrite",
    mode: "replace",
    icon: <MagicWand weight="fill" />,
    label: "Rewrite Professionally",
    description:
      "Rewrite in a professional and polished tone while preserving all facts, structure, headings, formatting, and intent.", task: "editStandard"
  },
  {
    id: "shorten",
    mode: "replace",
    icon: <TextAa />,
    label: "Shorten Text",
    description:
      "Reduce length by removing repetition and unnecessary details while retaining key information, structure, and formatting.", task: "editShort"
  },
  {
    id: "expand",
    mode: "replace",
    icon: <TextAa />,
    label: "Expand Topic",
    description:
      "Expand the content with deeper explanations, supporting details, examples, and context while preserving the existing structure, headings, lists, and formatting.", task: "generateLong"
  },
  {
    id: "grammar",
    mode: "replace",
    icon: <TextB />,
    label: "Fix Grammar",
    description:
      "Correct grammar, spelling, punctuation, and sentence structure without changing meaning, formatting, or organization.", task: "editShort"
  },
  {
    id: "tone",
    mode: "replace",
    icon: <MagicWand />,
    label: "Change Tone",
    description:
      "Adjust the tone to be more conversational and engaging while preserving content, structure, formatting, and information.", task: "editStandard"
  },
  {
    id: "simplify",
    mode: "replace",
    icon: <TextAa />,
    label: "Simplify Language",
    description:
      "Rewrite using simpler language and shorter sentences while preserving meaning, structure, formatting, and important details.", task: "editShort"
  },
  //  
  {
    id: "bullets",
    mode: "replace",
    icon: <List />,
    label: "Convert to Bullet Points",
    description:
      "Convert the content into clear, organized bullet points while retaining all important information and logical hierarchy.", task: "editStandard"
  },

  // ── APPEND commands (generate new sections added to the note) ──────────
  {
    id: "continue",
    mode: "append",
    icon: <CaretRight />,
    label: "Continue Writing",
    description:
      "Continue the content naturally from the current position, matching the existing style, tone, context, and structure.",
    task: "generateLong"
  },
  {
    id: "notes",
    mode: "append",
    icon: <Textbox />,
    label: "Add Important Notes",
    description:
      "Generate a concise 'Important Notes' section highlighting key insights, warnings, takeaways, or essential points.",
    task: "generateShort"
  },
  {
    id: "related",
    mode: "append",
    icon: <LinkSimple />,
    label: "Add Related Topics",
    description:
      "Suggest relevant topics, concepts, or subtopics that naturally extend the current content.",
    task: "generateShort"
  },
  // {
  //   id: "explain",
  //   mode: "append",
  //   icon: <ChatTeardropText />,
  //   label: "Explain This",
  //   description:
  //     "Add a clear and beginner-friendly explanation of the selected content using simple language and practical examples when helpful.",
  //   task: "generateStandard"
  // },

  {
    id: "conclusion",
    mode: "append",
    icon: <Quotes />,
    label: "Add Conclusion",
    description:
      "Write a conclusion that summarizes the main points and provides a clear closing perspective.",
    task: "generateShort"
  },
];