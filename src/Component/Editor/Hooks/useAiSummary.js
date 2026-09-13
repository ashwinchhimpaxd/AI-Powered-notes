import { useState, useRef, useCallback, useEffect } from "react";
import { generateSummary } from "../services/summary.service.js";
import { showToast } from "../utils/showToast.js";
import { handleError } from "@/utils/errorHandler.js";
/**
 * Manages summary panel state and AI generation.
 * Editor is stored as a ref via setEditor() to avoid hook-count issues.
 */
export function useAiSummary() {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [summaryError, setSummaryError] = useState(null);

  const editorRef = useRef(null);
  const [abortController, setAbortController] = useState(null);

  const setEditor = useCallback((ed) => { editorRef.current = ed; }, []);

  const openSummary = useCallback(() => setSummaryOpen(true), []);

  const closeSummary = useCallback(() => {
    setSummaryOpen(false);
    // Cancel the active request if summary panel is closed
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  }, [abortController]);

  const handleSummary = useCallback(async () => {
    setSummaryOpen(true);
    setSummaryLoading(true);
    setSummaryError(null);
    setSummaryData(null);

    // Cancel any previous summary request that might be running
    if (abortController) {
      abortController.abort();
    }

    // Create a new AbortController for this request
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const noteText = editorRef.current?.getText()?.trim() || "";
      const data = await generateSummary(noteText, controller.signal);
      setSummaryData(data);

    } catch (err) {
      // Check if error is due to request abort / cancellation
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED" || err?.message === "canceled") {
        return; // Silently exit, do not show error/toast
      }


      const msg = err?.message || "";
      const status = err?.status ?? err?.statusCode;
      const isShort = msg.toLowerCase().includes("too short");

      if (isShort) {
        showToast("warning", "Note is too short to summarize. Write more content first.");
      } else if (status === 429 || msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("rate limit")) {
        showToast("warning", "AI rate limit reached. Please wait a moment and try again.");
      } else if (status >= 500 || msg.includes("503")) {
        showToast("server", "AI service is temporarily unavailable. Please try again shortly.");
      } else if (!navigator.onLine) {
        showToast("network", "No internet connection. Summary requires a network.");
      } else {
        handleError(err, { action: "Generating summary", silent: false });
      }
      setSummaryError(msg || "Failed to generate summary. Please try again.");
    } finally {
      setAbortController(null);
      setSummaryLoading(false);
    }
  }, [abortController]);

  // Cancel any active AI summary request if the component unmounts
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  return {
    summaryOpen,
    summaryLoading,
    summaryData,
    summaryError,
    openSummary,
    closeSummary,
    handleSummary,
    setEditor,
  };
}
