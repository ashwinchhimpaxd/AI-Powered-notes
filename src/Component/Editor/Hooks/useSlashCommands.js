import { useState, useRef, useCallback, useEffect } from "react";
import { AI_COMMANDS } from "../constants/aiCommands";
import { runAiCommand, cleanHtmlResponse } from "../services/ai.service.js";
import { showToast } from "../utils/showToast.js";

export function useSlashCommands() {
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashCoords, setSlashCoords] = useState({ top: 0, left: 0 });
  const [slashQuery, setSlashQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState("");

  const editorRef = useRef(null);
  const slashOpenRef = useRef(false);

  // Sync mirror of slashQuery — lets updateQuery read the current value
  // synchronously inside a useCallback without adding it to the dep array.
  const slashQueryRef = useRef("");

  const setEditor = useCallback((ed) => { editorRef.current = ed; }, []);

  // ── Stable callback refs exposed to useTiptapEditor ──────────────────
  const onSlashOpenRef = useRef(null);
  const onSlashQueryRef = useRef(null);
  const onSlashCloseRef = useRef(null);

  // ── Open / Close ───────────────────────────────────────────────────────
  const openSlash = useCallback((coords) => {
    slashQueryRef.current = "";
    setSlashCoords(coords);
    setSlashQuery("");
    slashOpenRef.current = true;
    setSlashMenuOpen(true);
  }, []);

  const closeSlash = useCallback(() => {
    slashOpenRef.current = false;
    slashQueryRef.current = "";
    setSlashMenuOpen(false);
    setSlashQuery("");
  }, []);

  // ── Query update — called per keystroke/update from useTiptapEditor ───────────
  const updateQuery = useCallback((fullQuery) => {
    slashQueryRef.current = fullQuery;
    setSlashQuery(fullQuery);
  }, []);

  // Keep callback refs in sync with latest stable functions
  useEffect(() => { onSlashOpenRef.current = openSlash; }, [openSlash]);
  useEffect(() => { onSlashCloseRef.current = closeSlash; }, [closeSlash]);
  useEffect(() => { onSlashQueryRef.current = updateQuery; }, [updateQuery]);

  // ── Filtered commands ──────────────────────────────────────────────────
  const filteredCommands = slashQuery
    ? AI_COMMANDS.filter(
      (cmd) => cmd.label.toLowerCase().includes(slashQuery.toLowerCase()) || cmd.description.toLowerCase().includes(slashQuery.toLowerCase())
    ): AI_COMMANDS;

  // Close automatically when no commands match (e.g. user typed "/xyzabc")
  useEffect(() => {
    if (slashMenuOpen && slashQuery.length > 0 && filteredCommands.length === 0) {
      closeSlash();
    }
  }, [filteredCommands.length, slashMenuOpen, slashQuery, closeSlash]);

  // ── Execute AI command ─────────────────────────────────────────────────
  const handleCommand = useCallback(async (cmd) => {
    const editor = editorRef.current;
    if (!editor) return;

    const capturedQuery = slashQueryRef.current;
    closeSlash();

    // Delete the "/" + any typed filter characters from the editor
    const { from } = editor.state.selection;
    const deleteFrom = Math.max(0, from - 1 - capturedQuery.length);
    if (deleteFrom < from) {
      editor.chain().focus().deleteRange({ from: deleteFrom, to: from }).run();
    }

    // After deleting the slash command, check if the editor is actually empty.
    // If it is empty, we don't want to waste an API call.
    if (editor.getText().trim() === "") {
      showToast("warning", "Editor is empty. Please write something first before using AI commands.");
      return;
    }

    setAiLoading(true);
    setAiStatus(`${cmd.label}…`);

    const originalHtml = editor.getHTML();
    const headerHtml = cmd.mode === "append" ? `<p><strong style="color:#a78bfa">✦ ${cmd.label}</strong></p>` : "";

    try {
      await runAiCommand(
        cmd.id,
        cmd.label,
        cmd.mode,
        originalHtml,
        (streamedText) => {
          const parsedHtml = cleanHtmlResponse(streamedText);
          if (cmd.mode === "replace") {
            editor.commands.setContent(parsedHtml);
          } else {
            editor.commands.setContent(originalHtml + headerHtml + parsedHtml);
          }
          editor.commands.focus("end");
        },
        cmd.task
      );
    } catch (err) {
      console.error("AI command error:", err);
      const msg = err?.message || "";
      const status = err?.status ?? err?.statusCode;

      if (status === 429 || msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("rate limit")) {
        showToast("warning", "AI rate limit reached. Please wait a moment and try again.");
      } else if (status >= 500 || msg.includes("503")) {
        showToast("server", "AI service is temporarily unavailable. Please try again shortly.");
      } else if (!navigator.onLine) {
        showToast("network", "No internet connection. AI features require a network.");
      } else {
        showToast("error", `AI failed for "${cmd.label}". Please try again.`);
      }
    } finally {
      setAiLoading(false);
      setAiStatus("");
    }
  }, [closeSlash]);

  return {
    slashMenuOpen,
    slashCoords,
    slashQuery,
    aiLoading,
    aiStatus,
    filteredCommands,
    closeSlash,
    handleCommand,
    setEditor,
    slashOpenRef,
    onSlashOpenRef,
    onSlashQueryRef,
    onSlashCloseRef,
  };
}
