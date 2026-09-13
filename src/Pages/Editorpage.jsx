import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Query } from 'appwrite';
import { CircleNotch } from '@phosphor-icons/react';
import AntigravityEditor from '../Component/Editor/AntigravityEditor';
import service from '../AppWrite/Setgetuserdatas/config.js';
import { setnoteid, setcurrentnoteinfo } from '../redux/currentnoteinfoslice/currentnoteinfoslice.js';
import { selectAllNotes } from '../redux/NotesCreation/NotesCreationSlice.js';
import { showToast } from '../Component/Editor/utils/showToast.js';


function Editorpage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();


    const [editorInstance, seteditorInstance] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Redux note details
    const currentNoteInfo = useSelector((state) => state.currentnoteinfoslice.currentnoteinfo);
    const reduxNoteId = useSelector((state) => state.currentnoteinfoslice.noteid);
    const allNotes = useSelector(selectAllNotes);

    // useEffect(() => {
    //     if (editorInstance) { /* editor ready */ }
    // }, [editorInstance]);


    // Load note dynamic logic by URL slug parameter
    useEffect(() => {
        const loadNote = async () => {
            if (!slug) return;

            // 1. If currently loaded note in Redux already matches the URL slug, do nothing!
            if (currentNoteInfo?.slug === slug) {
                return;
            }

            // Check actions on the active loaded note
            if (reduxNoteId) {
                const activeNoteInCache = allNotes.find(note => note.$id === reduxNoteId);
                if (activeNoteInCache) {
                    // 1b. If the URL slug matches the cached slug of the active note,
                    // but currentNoteInfo.slug has been edited and is different, we are currently saving.
                    // Do nothing (don't reload the note and revert changes).
                    if (activeNoteInCache.slug === slug) {
                        return;
                    }

                    // 2. If the active note's slug in the cache has updated (after successful save),
                    // but the URL slug is still the old one, update the URL slug.
                    if (activeNoteInCache.slug && activeNoteInCache.slug !== slug) {
                        navigate(`/Dashboard/editor/${activeNoteInCache.slug}`, { replace: true });
                        return;
                    }
                }
            }

            // 3. Try to find the note locally in Redux cache (allNotes)
            const localNote = allNotes.find(note => note.slug === slug);
            if (localNote) {
                dispatch(setnoteid(localNote.$id));
                dispatch(setcurrentnoteinfo({
                    title: localNote.notes_title || "",
                    slug: localNote.slug || "",
                    content: localNote.notes_contect || "",
                    images: localNote.notes_images || [],
                    isimportant: localNote.is_note_important || false
                }));
                return;
            }

            // 4. Fallback: Fetch the note from Appwrite server by slug
            setIsLoading(true);
            try {
                const response = await service.getNotes([
                    Query.equal("slug", slug)
                ]);

                if (response && response.documents && response.documents.length > 0) {
                    const serverNote = response.documents[0];
                    dispatch(setnoteid(serverNote.$id));
                    dispatch(setcurrentnoteinfo({
                        title: serverNote.notes_title || "",
                        slug: serverNote.slug || "",
                        content: serverNote.notes_contect || "",
                        images: serverNote.notes_images || [],
                        isimportant: serverNote.is_note_important || false
                    }));
                } else {
                    showToast("warning", "Note not found. Redirecting to your notes.");
                    navigate("/Dashboard/recent-notes");
                }
            } catch (error) {
                showToast("error", "Failed to load note. Please try again.");
                navigate("/Dashboard/recent-notes");

            } finally {
                setIsLoading(false);
            }
        };

        loadNote();
    }, [slug, allNotes, currentNoteInfo, reduxNoteId, dispatch, navigate]);

    if (isLoading) {
        return (
            <div className="w-full h-screen bg-[#0d0d0f] flex flex-col justify-center items-center font-sans text-white relative overflow-hidden">
                {/* Ambient background glows */}
                <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/8 blur-[120px] rounded-full pointer-events-none z-0" />
                <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/8 blur-[120px] rounded-full pointer-events-none z-0" />

                <div className="relative z-10 flex flex-col items-center gap-4 bg-[#18181b]/50 border border-white/10 rounded-2xl p-8 backdrop-blur-2xl shadow-2xl">
                    <CircleNotch className="size-10 text-purple-400 animate-spin" />
                    <p className="text-white/70 text-sm font-medium tracking-wide animate-pulse">Loading note content...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-screen">
            <div className="w-full h-full flex flex-col">
                <AntigravityEditor onEditorReady={seteditorInstance} />
            </div>
        </div>
    );
}

export default Editorpage;