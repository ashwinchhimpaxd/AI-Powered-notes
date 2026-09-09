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
    description: "Enhance clarity, readability, and flow while preserving the original meaning, structure, headings, lists, formatting, and key information.", task: "note"
  },
  {
    id: "rewrite",
    mode: "replace",
    icon: <MagicWand weight="fill" />,
    label: "Rewrite Professionally",
    description:
      "Rewrite in a professional and polished tone while preserving all facts, structure, headings, formatting, and intent.", task: "note"
  },
  {
    id: "shorten",
    mode: "replace",
    icon: <TextAa />,
    label: "Shorten Text",
    description:
      "Reduce length by removing repetition and unnecessary details while retaining key information, structure, and formatting.", task: "chat"
  },
  {
    id: "expand",
    mode: "replace",
    icon: <TextAa />,
    label: "Expand Topic",
    description:
      "Expand the content with deeper explanations, supporting details, examples, and context while preserving the existing structure, headings, lists, and formatting.", task: "complex"
  },
  {
    id: "grammar",
    mode: "replace",
    icon: <TextB />,
    label: "Fix Grammar",
    description:
      "Correct grammar, spelling, punctuation, and sentence structure without changing meaning, formatting, or organization.", task: "chat"
  },
  {
    id: "tone",
    mode: "replace",
    icon: <MagicWand />,
    label: "Change Tone",
    description:
      "Adjust the tone to be more conversational and engaging while preserving content, structure, formatting, and information.",task: "note"
  },
  {
    id: "simplify",
    mode: "replace",
    icon: <TextAa />,
    label: "Simplify Language",
    description:
      "Rewrite using simpler language and shorter sentences while preserving meaning, structure, formatting, and important details.", task: "chat"
  },
  //  
  {
    id: "bullets",
    mode: "replace",
    icon: <List />,
    label: "Convert to Bullet Points",
    description:
      "Convert the content into clear, organized bullet points while retaining all important information and logical hierarchy.", task: "summarize"
  },

  // ── APPEND commands (generate new sections added to the note) ──────────
  {
    id: "continue",
    mode: "append",
    icon: <CaretRight />,
    label: "Continue Writing",
    description:
      "Continue the content naturally from the current position, matching the existing style, tone, context, and structure.", task: "complex"
  },
  {
    id: "notes",
    mode: "append",
    icon: <Textbox />,
    label: "Add Important Notes",
    description:
      "Generate a concise 'Important Notes' section highlighting key insights, warnings, takeaways, or essential points.",task: "complex"
  },
  {
    id: "related",
    mode: "append",
    icon: <LinkSimple />,
    label: "Add Related Topics",
    description:
      "Suggest relevant topics, concepts, or subtopics that naturally extend the current content.",
      task:"note"
  },
  {
    id: "explain",
    mode: "append",
    icon: <ChatTeardropText />,
    label: "Explain This",
    description:
      "Add a clear and beginner-friendly explanation of the selected content using simple language and practical examples when helpful.", task: "chat"
  },
  // {
  //   id: "summarize",
  //   mode: "append",
  //   icon: <ListBullets />,
  //   label: "Summarize Section",
  //   description:
  //     "Generate a concise summary covering the most important ideas, conclusions, and key takeaways."
  // },
  // {
  //   id: "flashcards",
  //   mode: "append",
  //   icon: <Textbox />,
  //   label: "Generate Flashcards",
  //   description:
  //     "Create study flashcards in a question-and-answer format covering the most important concepts from the content."
  // },
  // {
  //   id: "studynotes",
  //   mode: "append",
  //   icon: <TextHOne />,
  //   label: "Create Study Notes",
  //   description:
  //     "Generate well-structured study notes with headings, key concepts, definitions, examples, and important takeaways."
  // },
  {
    id: "conclusion",
    mode: "append",
    icon: <Quotes />,
    label: "Add Conclusion",
    description:
      "Write a conclusion that summarizes the main points and provides a clear closing perspective."
    , task: "summarize"
  },
  // {
  //   id: "title",
  //   mode: "append",
  //   icon: <TextHOne />,
  //   label: "Generate Title",
  //   description:
  //     "Generate a concise, descriptive, and relevant title that accurately represents the content."
  // },
  // {
  //   id: "actions",
  //   mode: "append",
  //   icon: <ListBullets />,
  //   label: "Create Action Items",
  //   description:
  //     "Extract actionable tasks, next steps, or to-do items and present them as a structured checklist."
  // },
  // {
  //   id: "quiz",
  //   mode: "append",
  //   icon: <Sparkle />,
  //   label: "Generate Quiz",
  //   description:
  //     "Create quiz questions with answers to test understanding of the key concepts covered in the content."
  // },
  // {
  //   id: "examples",
  //   mode: "append",
  //   icon: <CaretRight />,
  //   label: "Generate Examples",
  //   description:
  //     "Add practical, realistic, and relevant examples that help clarify and reinforce the concepts discussed."
  // }
];