import { useEffect, useState, useDeferredValue, memo, useCallback, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { SquaresFour, List, CircleNotch, FadersHorizontal, Plus } from "@phosphor-icons/react";
import { useSelector, useDispatch } from "react-redux";
import { deleteNote, updateNoteInPlace, selectNoteIds, selectNoteById } from "../../../redux/NotesCreation/NotesCreationSlice.js";
import { setnoteid, setcurrentnoteinfo } from "../../../redux/currentnoteinfoslice/currentnoteinfoslice.js";
import service from "@/AppWrite/Setgetuserdatas/config.js";
import StorageService from "../../../AppWrite/Setgetuserdatas/StorageImages/ImageUpload.js";
import { executeOptimisticToggle } from "../../../utils/optimisticToggle.js";
import NoteCard from "./NoteCard.jsx";
import NoteSkeleton from "./NoteSkeleton.jsx";
import DeleteConfirmationModal from "./DeleteConfirmationModal.jsx";
import { selectFilteredNoteIds } from "../../../redux/NotesCreation/NotesSelector.js";
import FilterModal from "../filternote/FilterModal.jsx";
import { fetchNotesThunk } from "../../../redux/NotesCreation/NotesCreationSlice.js";
import NoteStatistics from "../../AIActivity.jsx";
import NotesCreationForm from "../NotesCreationForm.jsx";
import { showToast } from "../../Editor/utils/showToast.js";




const RecentNotes = memo((props) => {
    const context = useOutletContext();
    const searchQuery = context?.searchQuery ?? props.searchQuery ?? "";
    const isCreatingNote = context?.isCreatingNote ?? props.isCreatingNote ?? false;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isGridView, setIsGridView] = useState(true);
    const [openNoteMenuId, setOpenNoteMenuId] = useState(null);
    const [noteToDelete, setNoteToDelete] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [NewNotesClick, setNewNotesClick] = useState(false);

    const noteIds = useSelector(selectNoteIds);
    const noteData = useSelector((state) =>
        noteToDelete ? selectNoteById(state, noteToDelete) : null
    );

    const { loading, hasMore, lastCursor, filter } = useSelector((state) => state.NotesCreation);
    const currentuserID = useSelector((state) => state.UserAuthantication.UserData?.userdetaild?.$id) || "";

    // Trigger initial fetch or reload when filters/user changes
    useEffect(() => {
        if (!currentuserID) return;

        // Fetch notes if:
        // 1. Redux slice is empty (first load or new login) OR
        // 2. lastCursor is null and hasMore is true (filters reset or changed)
        const isSliceEmpty = noteIds.length === 0;

        if (isSliceEmpty || (!lastCursor && hasMore)) {
            dispatch(fetchNotesThunk({ userId: currentuserID }));
        }
    }, [currentuserID, filter, lastCursor, hasMore, dispatch, noteIds.length]);

    // Load More function for Infinite Scroll
    const loadMoreNotes = useCallback(async () => {
        if (loading || !hasMore || !lastCursor || !currentuserID) return;

        dispatch(fetchNotesThunk({ userId: currentuserID }));
    }, [loading, hasMore, lastCursor, currentuserID, dispatch]);

    // handle delete notes 
    const handleDeleteMenu = useCallback((id) => {
        setNoteToDelete(id);
        setOpenNoteMenuId(null);
    }, []);

    const handleScroll = useCallback((e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 80) { // 80px boundary
            loadMoreNotes();
        }
    }, [loadMoreNotes]);

    const deferredSearchQuery = useDeferredValue(searchQuery);

    const filteredNoteIds = useSelector((state) =>
        selectFilteredNoteIds(state, deferredSearchQuery)
    );

    const toggleNoteMenu = useCallback((noteId) => {
        setOpenNoteMenuId(prevId => prevId === noteId ? null : noteId);
    }, []);

    const toggleStar = useCallback((e, note) => {
        e.stopPropagation();

        executeOptimisticToggle({
            key: `note-important-${note.$id}`,
            initialValue: note.is_note_important,
            originalData: note,
            onOptimisticUpdate: (newImportance) => {
                const updatedNote = { ...note, is_note_important: newImportance };
                dispatch(updateNoteInPlace(updatedNote));
            },
            apiCall: async (newImportance) => {
                await service.updateNote(note.$id, {
                    slug: note.slug,
                    Notes_title: note.notes_title,
                    Notes_contents: note.notes_contect,
                    notes_images: note.notes_images || [],
                    Is_note_important: newImportance
                });
            },
            onRollback: (originalNote) => {
                dispatch(updateNoteInPlace(originalNote));
            }
        });
    }, [dispatch]);

    const handleNoteClick = useCallback((note) => {
        dispatch(setnoteid(note.$id));
        dispatch(setcurrentnoteinfo({
            title: note.notes_title || "",
            slug: note.slug || "",
            content: note.notes_contect || "",
            images: note.notes_images || [],
            isimportant: note.is_note_important || false
        }));
        if (note.slug) {
            navigate(`/Dashboard/editor/${note.slug}`);
        } else {
            navigate("/Dashboard/editor");
        }
    }, [dispatch, navigate]);

    const confirmDelete = useCallback(async () => {
        if (noteToDelete) {
            const targetNoteId = noteToDelete;
            const targetNoteData = noteData;
            dispatch(deleteNote(targetNoteId));
            setNoteToDelete(null);

            try {
                if (targetNoteData && targetNoteData.notes_images && targetNoteData.notes_images.length > 0) {
                    await Promise.all(
                        targetNoteData.notes_images.map(async (imgRaw) => {
                            try {
                                const img = typeof imgRaw === 'string' ? JSON.parse(imgRaw) : imgRaw;
                                if (img.fileId) {
                                    await StorageService.deleteImage(img.fileId);
                                }
                            } catch (err) {
                                showToast("warning", "Some note images could not be deleted.");
                            }
                        })
                    );
                }
                await service.deleteNote(targetNoteId);
            } catch (error) {
                console.error("Error completely deleting note:", error);
                showToast("error", "Failed to delete the note. Please try again.");
            }
        }
    }, [noteToDelete, dispatch, noteData]);

    return (
        <div className="flex flex-col min-h-100">
            {/* Header Area */}
            <div className="flex items-end justify-between mb-6 ">
                <div>
                    <h2 className="text-foreground text-3xl font-bold tracking-tight">Recent Notes</h2>
                    <p className="text-muted-foreground text-sm mt-1">Continue where you left off or ask AI to summarize.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-card hover:bg-muted border border-border rounded-lg text-sm font-medium text-foreground transition-colors cursor-pointer "
                    >
                        <FadersHorizontal className="size-4" /> Filter
                    </button>
                    {/* Toggle Button */}
                    <button
                        type="button"
                        id="grid-btn"
                        onClick={() => setIsGridView(!isGridView)}
                        className="flex items-center cursor-pointer justify-center p-1.5 bg-card hover:bg-muted border border-border rounded-lg text-foreground transition-colors"
                        title={isGridView ? "Switch to List View" : "Switch to Grid View"}
                        aria-label={isGridView ? "Switch to List View" : "Switch to Grid View"}
                    >
                        {/* Swaps the icon based on the current state */}
                        {isGridView ? <List className="size-5" /> : <SquaresFour className="size-5" />}
                    </button>
                </div>
            </div>

            {/* Note Grid */}
            <div className="flex-1">
                {/* LOADING STATE (FIRST PAGE) */}
                {loading && filteredNoteIds.length === 0 && (
                    <div className="flex justify-center items-center py-20">
                        <CircleNotch className="size-8 text-[#8b5cf6] animate-spin" />
                    </div>
                )}

                {/* EMPTY STATE */}
                {!loading && filteredNoteIds.length === 0 && !isCreatingNote && (
                    <div className="flex flex-col  items-center justify-center py-20 border border-dashed border-border rounded-xl bg-card">
                        <p className="text-muted-foreground text-xl font-medium flex w-fit justify-center items-center gap-4  ">
                            <span>Create your first note</span>

                            <button
                                type="button"
                                onClick={() => {
                                    setNewNotesClick(true);
                                }}
                                className="p-2 sm:p-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                                aria-label="Create note"
                            >
                                <Plus className="size-4" weight="bold" />
                            </button>
                        </p>
                        {NewNotesClick && <NotesCreationForm setNewNotesClick={setNewNotesClick} />}
                    </div>  
                )}

                {/* NOTES GRID */}
                {(filteredNoteIds.length > 0 || !loading) && (
                    <div
                        onScroll={handleScroll}
                        // Conditionally apply Grid or List (flex-col) classes here:
                        className={`gap-5 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 pb-10 transition-all duration-300 ${isGridView
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                            : "flex flex-col w-full  mx-auto" // List view classes
                            }`}
                    >
                        {/* Skeleton Loader for AI Note Generation */}
                        {isCreatingNote && <NoteSkeleton isGridView={isGridView} />}

                        {filteredNoteIds.map((id) => (
                            <NoteCard
                                key={id}
                                noteId={id}
                                isGridView={isGridView}
                                openMenu={openNoteMenuId === id}
                                onToggleMenu={toggleNoteMenu}
                                onToggleStar={toggleStar}
                                onDelete={handleDeleteMenu}
                                onClick={handleNoteClick}
                            />
                        ))}
                        {loading && filteredNoteIds.length > 0 && (
                            <div className="col-span-full flex justify-center py-4">
                                <CircleNotch className="size-6 text-[#52525b] animate-spin" />
                            </div>
                        )}
                    </div>
                )}

                {/* CONFIRMATION MODAL */}
                <DeleteConfirmationModal
                    isOpen={!!noteToDelete}
                    onClose={() => setNoteToDelete(null)}
                    onConfirm={confirmDelete}
                />

                {/* FILTER MODAL */}
                <FilterModal
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                />
            </div>
            <div className="hidden md:block">
                <NoteStatistics />
            </div>
        </div>
    );
});

export default RecentNotes;
