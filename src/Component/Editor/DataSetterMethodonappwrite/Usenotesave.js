import { useState, useRef, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setcurrentnoteinfo, setnoteid } from "../../../redux/currentnoteinfoslice/currentnoteinfoslice.js";
import { addNoteToTop, updateNoteInSlice } from "../../../redux/NotesCreation/NotesCreationSlice.js";
import service from "../../../AppWrite/Setgetuserdatas/config.js";
import StorageService from "../../../AppWrite/Setgetuserdatas/StorageImages/ImageUpload.js";
import { showToast } from "../utils/showToast.js";
import { domParser, getPlainText, cleanText, cleanHtml, getImagesString } from "./noteUtils.js";
import { useAutosave } from "./useAutosave.js";

/**
 * useNoteSave
 *
 * Main orchestrator for note persistence.
 * Handles: title/slug state, Appwrite CRUD (create/update), Redux dispatch.
 *
 * Autosave debounce logic lives in  useAutosave.js
 * Pure HTML/text utilities live in  noteUtils.js
 */
export function useNoteSave(editor, slashOpenRef, isAiGenerating) {
    const dispatch = useDispatch();

    const reduxNoteId   = useSelector((s) => s.currentnoteinfoslice.noteid);
    const userData      = useSelector((s) => s.UserAuthantication.UserData);
    const noteData      = useSelector((s) => s.currentnoteinfoslice.currentnoteinfo);
    const noteTitle     = noteData.title;
    const savingTimer   = useSelector((s) => s.WebSettingConfig.SavingNoteTimer);
    const notesEntities = useSelector((s) => s.NotesCreation.entities);

    const initialCleanTitle = noteTitle?.trim()?.replace(/\s+/g, " ") || "";
    const initialGeneratedSlug = initialCleanTitle
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

    const [title, setTitle]             = useState(initialCleanTitle);
    const [slug, setSlug]               = useState(initialGeneratedSlug);
    const [isSaving, setIsSaving]       = useState(false);
    const [isNoteSaved, setIsNoteSaved] = useState(true);

    const userDataRef       = useRef(userData);
    const reduxNoteIdRef    = useRef(reduxNoteId);
    const titleRef          = useRef(title);
    const slugRef           = useRef(slug);
    const noteDataRef       = useRef(noteData);
    const notesEntitiesRef  = useRef(notesEntities);
    const savingTimerRef    = useRef(savingTimer);
    const isAiGeneratingRef = useRef(false);
    const isSavingRef       = useRef(false);
    const isLoadedRef       = useRef(false);
    const hydratedNoteIdRef = useRef(null);
    const timeoutRef        = useRef(null);

    const lastSavedContent = useRef(noteData?.content || "");
    const lastSavedText    = useRef(noteData?.content ? getPlainText(noteData.content) : "");
    const lastSavedTitle   = useRef(initialCleanTitle);
    const lastSavedSlug    = useRef(initialGeneratedSlug);

    useEffect(() => { userDataRef.current = userData; },           [userData]);
    useEffect(() => { reduxNoteIdRef.current = reduxNoteId; },     [reduxNoteId]);
    useEffect(() => { noteDataRef.current = noteData; },           [noteData]);
    useEffect(() => { titleRef.current = title; },                 [title]);
    useEffect(() => { slugRef.current = slug; },                   [slug]);
    useEffect(() => { savingTimerRef.current = savingTimer; },     [savingTimer]);
    useEffect(() => { notesEntitiesRef.current = notesEntities; }, [notesEntities]);
    useEffect(() => { isAiGeneratingRef.current = isAiGenerating; }, [isAiGenerating]);

    // Mark note unsaved when AI finishes (render-phase comparison)
    const [prevAiGenerating, setPrevAiGenerating] = useState(isAiGenerating);
    if (isAiGenerating !== prevAiGenerating) {
        setPrevAiGenerating(isAiGenerating);
        if (!isAiGenerating && editor && !editor.isDestroyed && editor.state) {
            const currentContent = editor.getHTML();
            const imagesString   = getImagesString(currentContent);
            const hasChanged =
                cleanText(editor.getText()) !== cleanText(lastSavedText.current) ||
                imagesString !== getImagesString(lastSavedContent.current) ||
                cleanHtml(currentContent) !== cleanHtml(lastSavedContent.current);
            if (hasChanged) setIsNoteSaved(false);
        }
    }

    // Hydrate title/slug when a note is loaded or switched
    useEffect(() => {
        if (!reduxNoteId || !noteTitle) return;
        if (reduxNoteId === hydratedNoteIdRef.current) return;

        hydratedNoteIdRef.current = reduxNoteId;

        const cleanTitle    = noteTitle.trim().replace(/\s+/g, " ");
        const generatedSlug = cleanTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

        setTitle(cleanTitle);
        setSlug(generatedSlug);
        lastSavedTitle.current = cleanTitle;
        lastSavedSlug.current  = generatedSlug;

        if (noteDataRef.current?.content) {
            lastSavedContent.current = noteDataRef.current.content;
            lastSavedText.current    = getPlainText(noteDataRef.current.content);
        }

        dispatch(setcurrentnoteinfo({ ...noteDataRef.current, title: cleanTitle, slug: generatedSlug }));
    }, [reduxNoteId, noteTitle, dispatch]);

    // commitTitle - called onBlur or Enter from the title input
    const commitTitle = (rawTitle) => {
        const cleanTitle    = rawTitle.trim().replace(/\s+/g, " ");
        const generatedSlug = cleanTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

        setTitle(cleanTitle);
        titleRef.current = cleanTitle;

        if (cleanTitle.length > 0) {
            setSlug(generatedSlug);
            slugRef.current = generatedSlug;
            dispatch(setcurrentnoteinfo({ ...noteDataRef.current, title: cleanTitle, slug: generatedSlug }));
        } else {
            setSlug("");
            slugRef.current = "";
            dispatch(setcurrentnoteinfo({ ...noteDataRef.current, title: "", slug: "" }));
        }

        if (cleanTitle !== lastSavedTitle.current || generatedSlug !== lastSavedSlug.current) {
            setIsNoteSaved(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => handleSave(editor), 1000);
        }
    };

    const toggleImportant = (editorInstance) => {
        const newValue = !noteDataRef.current.isimportant;
        dispatch(setcurrentnoteinfo({ ...noteDataRef.current, isimportant: newValue }));
        setIsNoteSaved(false);
        const delay = savingTimer === "off" ? 3000 : savingTimer;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => handleSave(editorInstance), delay);
    };

    // handleSave - safe to call from button OR autosave timer
    const handleSave = useCallback(async (currentEditor) => {
        if (!currentEditor) return;
        if (isSavingRef.current) return;
        if (isAiGeneratingRef.current) {
            showToast("warning", "Please wait for AI to finish generating content.");
            return;
        }

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        const currentContent = currentEditor.getHTML();
        const currentText    = currentEditor.getText().trim();
        const currentTitle   = titleRef.current;
        const currentSlug    = slugRef.current;

        if (currentText === "" && !currentContent.includes("<img>")) {
            showToast("warning", "Note cannot be empty.");
            return;
        }

        const imagesString   = getImagesString(currentContent);
        const contentChanged =
            cleanText(currentText) !== cleanText(lastSavedText.current) ||
            imagesString !== getImagesString(lastSavedContent.current) ||
            cleanHtml(currentContent) !== cleanHtml(lastSavedContent.current);
        const metadataChanged =
            currentTitle !== lastSavedTitle.current ||
            currentSlug  !== lastSavedSlug.current;

        if (!contentChanged && !metadataChanged) {
            setIsNoteSaved(true);
            return;
        }

        setIsSaving(true);
        isSavingRef.current = true;

        try {
            const currentNoteId   = reduxNoteIdRef.current;
            const currentUserData = userDataRef.current;

            const doc    = domParser.parseFromString(currentContent, "text/html");
            const images = Array.from(doc.querySelectorAll("img")).flatMap((img) => {
                const fileId = img.getAttribute("data-file-id");
                const url    = img.getAttribute("src");
                return fileId && url && url.startsWith("http") ? [{ fileId, url }] : [];
            });
            const stringifiedImages    = images.map((img) => JSON.stringify(img));
            const currentImagesFileIds = images.map((img) => img.fileId);

            const fileIdsToDelete = new Set();
            const pendingImages   = JSON.parse(localStorage.getItem("pending_appwrite_images") || "[]");
            pendingImages.forEach((id) => {
                if (!currentImagesFileIds.includes(id)) fileIdsToDelete.add(id);
            });

            if (currentNoteId) {
                const oldNote      = notesEntitiesRef.current[currentNoteId];
                const oldImagesRaw = oldNote?.notes_images || [];
                const oldImages    = oldImagesRaw.flatMap((str) => {
                    try { const p = JSON.parse(str); return p ? [p] : []; }
                    catch { return []; }
                });
                oldImages.forEach((img) => {
                    if (img.fileId && !currentImagesFileIds.includes(img.fileId)) {
                        fileIdsToDelete.add(img.fileId);
                    }
                });

                const updatedNote = await service.updateNote(currentNoteId, {
                    slug:              currentSlug,
                    Notes_title:       currentTitle,
                    Notes_contents:    currentContent,
                    notes_images:      stringifiedImages,
                    Is_note_important: noteDataRef.current.isimportant || false,
                });
                if (updatedNote) dispatch(updateNoteInSlice(updatedNote));

            } else {
                const userId =
                    currentUserData?.userdetaild?.userId ||
                    currentUserData?.userdetaild?.$id   ||
                    currentUserData?.userId             ||
                    currentUserData?.$id                ||
                    "anonymous";

                const response = await service.createNote({
                    Notes_title:       currentTitle,
                    slug:              currentSlug,
                    Notes_contents:    currentContent,
                    notes_images:      stringifiedImages,
                    Is_note_important: noteDataRef.current.isimportant || false,
                    User_Unique_ID:    userId,
                });
                if (response?.$id) {
                    dispatch(setnoteid(response.$id));
                    dispatch(addNoteToTop(response));
                }
            }

            if (fileIdsToDelete.size > 0) {
                await Promise.all(
                    Array.from(fileIdsToDelete).map(async (id) => {
                        try { await StorageService.deleteImage(id); }
                        catch (err) { console.error(`Failed to delete orphaned image ${id}:`, err); }
                    })
                );
            }

            localStorage.removeItem("pending_appwrite_images");
            lastSavedContent.current = currentContent;
            lastSavedText.current    = currentEditor.getText();
            lastSavedTitle.current   = currentTitle;
            lastSavedSlug.current    = currentSlug;
            setIsNoteSaved(true);

            dispatch(setcurrentnoteinfo({
                title:       currentTitle,
                slug:        currentSlug,
                content:     currentContent,
                images:      stringifiedImages,
                isimportant: noteDataRef.current.isimportant || false,
            }));

        } catch (error) {
            console.error("Error saving note:", error);
        } finally {
            setIsSaving(false);
            isSavingRef.current = false;
        }
    }, [dispatch]);

    // Plug in autosave hook
    useAutosave({
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
    });

    return {
        title,
        setTitle,
        slug,
        isSaving,
        isNoteSaved,
        commitTitle,
        handleSave,
        toggleImportant,
        isImportant: noteData?.isimportant,
    };
}
