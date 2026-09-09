import React, { memo } from "react";
import { CircleNotch } from "@phosphor-icons/react";

/**
 * Floating bottom pill shown while an AI command is running.
 *
 * @param {object}  props
 * @param {boolean} props.loading
 * @param {string}  props.status - label text e.g. "Improve Writing…"
 */
const AiLoadingOverlay = memo(function AiLoadingOverlay({ loading, status }) {
  if (!loading) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-300 flex items-center justify-center md:w-fit w-[90%] mx-auto  gap-3 p-3 rounded-full bg-card/97 backdrop-blur-2xl border border-purple-500/30 shadow-2xl shadow-purple-500/10">
      <CircleNotch size={20} className="animate-spin text-purple-400" />
      <span className="text-sm text-foreground/80 font-medium">{status}</span>
    </div>
  );
});

export default AiLoadingOverlay;
