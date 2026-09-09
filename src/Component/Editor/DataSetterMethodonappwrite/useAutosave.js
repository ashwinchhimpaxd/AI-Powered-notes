import { useEffect, useRef } from "react";
import { setcurrentnoteinfo } from "../../../redux/currentnoteinfoslice/currentnoteinfoslice.js";
import { cleanText, cleanHtml, getImagesString } from "./noteUtils.js";

/**
 * useAutosave
 *
 * Watches the Tiptap editor for content changes and schedules debounced saves.
 * Also handles:
 *   - Cancelling pending saves when AI generation starts
 *   - Triggering a save when AI generation completes (if content changed)
 *
 * @param {object} params
 * @param {object}   params.editor              - Tiptap editor instance
 * @param {Ref}      params.slashOpenRef         - whether slash menu is open
 * @param {Ref}      params.isAiGeneratingRef    - whether AI is generating (sync ref)
 * @param {function} params.handleSave           - stable save callback
 * @param {Ref}      params.savingTimerRef       - current debounce delay (ms) or "off"
 * @param {string}   params.savingTimer          - reactive timer value for the AI-complete effect
 * @param {boolean}  params.isAiGenerating       - reactive AI loading flag
 * @param {Ref}      params.lastSavedContent     - last successfully saved HTML
 * @param {Ref}      params.lastSavedText        - last successfully saved plain text
 * @param {Ref}      params.noteDataRef          - latest noteData from Redux
 * @param {Ref}      params.titleRef             - latest title value
 * @param {Ref}      params.slugRef              - latest slug value
 * @param {function} params.dispatch             - Redux dispatch
 * @param {function} params.setIsNoteSaved       - marks note as unsaved in parent
 * @param {Ref}      params.timeoutRef           - shared debounce timer ref (from parent)
 * @param {Ref}      params.isLoadedRef          - whether editor content has been normalized
 */
export function useAutosave({
    editor,
    slashOpenRef,
    isAiGeneratingRef,
    handleSave,
    savingTimerRef,
    savingTimer,
    isAiGenerating,
    lastSavedContent,
    lastSavedText,
    noteDataRef,
    titleRef,
    slugRef,
    dispatch,
    setIsNoteSaved,
    timeoutRef,
    isLoadedRef,
}) {
    // Internal ref for debouncing Redux sync (separate from save debounce)
    const reduxTimeoutRef = useRef(null);

    // -- Main autosave effect ------------------------------------------------
    useEffect(() => {
        if (!editor) return;

        let localTimeout = null;

        const handleUpdate = () => {
            // Ignore updates during programmatic loading phase
            if (!isLoadedRef.current) return;

            // Ignore updates while AI is streaming content
            if (isAiGeneratingRef.current) return;

            const currentContent = editor.getHTML();
            const currentText = editor.getText();

            // Sync content to Redux every 500ms (prevents data loss on refresh)
            if (reduxTimeoutRef.current) clearTimeout(reduxTimeoutRef.current);
            reduxTimeoutRef.current = setTimeout(() => {
                dispatch(
                    setcurrentnoteinfo({
                        title: titleRef.current,
                        slug: slugRef.current,
                        content: currentContent,
                        images: noteDataRef.current.images || [],
                        isimportant: noteDataRef.current.isimportant || false,
                    })
                );
            }, 500);

            // Ignore "/" trigger (slash menu open or trailing slash)
            if (slashOpenRef?.current) return;
            if (currentText.trim().endsWith("/")) return;

            // Only schedule save when there are meaningful changes
            const imagesString = getImagesString(currentContent);
            const hasChanged =
                cleanText(currentText) !== cleanText(lastSavedText.current) ||
                imagesString !== getImagesString(lastSavedContent.current) ||
                cleanHtml(currentContent) !== cleanHtml(lastSavedContent.current);

            if (!hasChanged) return;

            setIsNoteSaved(false);

            // Autosave is disabled
            if (savingTimerRef.current === "off") return;

            // Schedule the debounced save
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (localTimeout) clearTimeout(localTimeout);
            const nextTimeout = setTimeout(() => handleSave(editor), savingTimerRef.current);
            timeoutRef.current = nextTimeout;
            localTimeout = nextTimeout;
        };

        editor.on("update", handleUpdate);

        // Capture Tiptap-normalized content after initial setContent completes
        isLoadedRef.current = false;
        const initTimer = setTimeout(() => {
            if (editor.isDestroyed) return;
            lastSavedContent.current = editor.getHTML();
            lastSavedText.current = editor.getText();
            isLoadedRef.current = true;
        }, 100);

        return () => {
            editor.off("update", handleUpdate);
            clearTimeout(initTimer);
            if (localTimeout) clearTimeout(localTimeout);
        };
    }, [
        editor,
        dispatch,
        slashOpenRef,
        handleSave,
        noteDataRef,
        titleRef,
        slugRef,
        isAiGeneratingRef,
        isLoadedRef,
        lastSavedContent,
        lastSavedText,
        savingTimerRef,
        setIsNoteSaved,
        timeoutRef,
    ]);

    // -- Cancel pending saves when AI starts generating ----------------------
    useEffect(() => {
        if (isAiGenerating) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        }
    }, [isAiGenerating, timeoutRef]);

    // -- Trigger save when AI generation completes (if content changed) ------
    useEffect(() => {
        if (!editor || editor.isDestroyed || !editor.state) return;
        if (isAiGenerating) return;
        if (savingTimer === "off") return;

        const currentContent = editor.getHTML();
        const imagesString = getImagesString(currentContent);

        const hasChanged =
            cleanText(editor.getText()) !== cleanText(lastSavedText.current) ||
            imagesString !== getImagesString(lastSavedContent.current) ||
            cleanHtml(currentContent) !== cleanHtml(lastSavedContent.current);

        if (hasChanged) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => handleSave(editor), savingTimerRef.current);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isAiGenerating, editor, handleSave, savingTimer, savingTimerRef, lastSavedContent, lastSavedText, timeoutRef]);
}
