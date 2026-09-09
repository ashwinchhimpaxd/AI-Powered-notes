import React, { useEffect, useState } from "react";

// ── Hooks ──────────────────────────────────────────────────────────────────
import { useSlashCommands } from "./Hooks/useSlashCommands.js";
import { useAiSummary } from "./Hooks/useAiSummary.js";
import { useTiptapEditor } from "./Hooks/useTiptapEditor.js";
import { useNoteSave } from "./DataSetterMethodonappwrite/Usenotesave.js";

// ── UI Components ──────────────────────────────────────────────────────────
import EditorTopbar from "./Components/EditorTopbar.jsx";
import EditorCanvas from "./Components/EditorCanvas.jsx";
import SlashCommandMenu from "./Components/SlashCommandMenu.jsx";
import AiLoadingOverlay from "./Components/AiLoadingOverlay.jsx";
import SummaryPanel from "./Components/SummaryPanel.jsx";
import Aichatbox from "./Components/Aichatbox.jsx";
/**
 * AntigravityEditor — clean orchestrator.
 *
 * Each hook is called exactly once.
 * No business logic lives here — only wiring.
 */
export default function AntigravityEditor({ onEditorReady }) {


  const [showChat, setShowChat] = useState(false); // this showchat use to show chatbox on click on the ai icon in the text format toolbar 
  const [chatLoading, setChatLoading] = useState(false);
  const [chatStatus, setChatStatus] = useState("");
  // 1. Slash commands (initialised first — exposes stable refs for useTiptapEditor)
  const slash = useSlashCommands();

  // 2. Summary (same pattern — editor injected via setEditor after init)
  const summary = useAiSummary();

  // 3. Editor — receives stable callback refs from slash so it never recreates
  const { editor } = useTiptapEditor({
    onSlashOpenRef: slash.onSlashOpenRef,
    onSlashQueryRef: slash.onSlashQueryRef,
    onSlashCloseRef: slash.onSlashCloseRef,
    slashOpenRef: slash.slashOpenRef,
    onEditorReady,
  });

  // 4. Once the editor is ready, inject it into the hooks that need it
  useEffect(() => {
    if (!editor) return;
    slash.setEditor(editor);
    summary.setEditor(editor);
  }, [editor, slash.setEditor, summary.setEditor]);

  // 5. Save (autosave + manual + title)
  const isAiGenerating = slash.aiLoading || chatLoading;
  const { title, setTitle, isSaving, isNoteSaved, commitTitle, handleSave } = useNoteSave(editor, slash.slashOpenRef, isAiGenerating);

  if (!editor) return null;

  return (
    <div className="relative w-full min-h-screen bg-background text-foreground flex justify-center font-sans overflow-x-hidden ">

      {/* Ambient background glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/8 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/8 blur-[120px] rounded-full pointer-events-none z-0" />

      <EditorTopbar
        title={title}
        setTitle={setTitle}
        commitTitle={commitTitle}
        isSaving={isSaving}
        isNoteSaved={isNoteSaved}
        onSave={() => handleSave(editor)}
        onSummary={summary.handleSummary}
        onAiChat={setShowChat}
        editor={editor}
      />

      <EditorCanvas editor={editor} />

      <SlashCommandMenu
        open={slash.slashMenuOpen}
        coords={slash.slashCoords}
        query={slash.slashQuery}
        commands={slash.filteredCommands}
        onSelect={slash.handleCommand}
        onClose={slash.closeSlash}
      />

      <AiLoadingOverlay
        loading={slash.aiLoading || chatLoading}
        status={slash.aiStatus || chatStatus}
      />

      <SummaryPanel
        open={summary.summaryOpen}
        loading={summary.summaryLoading}
        data={summary.summaryData}
        error={summary.summaryError}
        onClose={summary.closeSummary}
        onGenerate={summary.handleSummary}
      />

      {/* this chat box show then user click on the ai icon in the text format toolbar  */}
      {showChat && (
        <div
          className="ai-chat-wrapper relative overflow-hidden z-200 bg-chatbox-bg/40"
          style={{
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: `
                      0 10px 40px rgba(0,0,0,0.25),
                      inset 0 1px 0 rgba(255,255,255,0.08)
                    `,
          }}
        >
          <Aichatbox
            editor={editor}
            onClose={() => setShowChat(false)}
            setLoading={setChatLoading}
            setStatus={setChatStatus}
            setTitle={setTitle}
            commitTitle={commitTitle}
          />
        </div>
      )}
    </div>
  );
}
