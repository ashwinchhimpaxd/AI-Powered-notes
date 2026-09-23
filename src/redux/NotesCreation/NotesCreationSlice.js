import {
    createSlice,
    createEntityAdapter,
    createAsyncThunk
} from "@reduxjs/toolkit";
import service from "../../AppWrite/Setgetuserdatas/config.js";
import { buildAppwriteQueries } from "./queryBuilder.js";

export const notesAdapter = createEntityAdapter({
    selectId: (note) => note.$id,
    sortComparer: false // Respect Appwrite server-side sorting strictly!
});

// Define standard initial filters matching standard radio options
const initialFilter = {
    importance: "all",  // "all" | "important" | "non-important"
    sort: "newest",     // "newest" | "oldest"
    startDate: null,    // "YYYY-MM-DD"
    endDate: null       // "YYYY-MM-DD"
};

const initialState = notesAdapter.getInitialState({
    filter: initialFilter,
    lastCursor: null,
    hasMore: true,
    loading: false,
    error: null
});

/**
 * Thunk to fetch notes asynchronously using cursor-based pagination and server-side filters.
 */
export const fetchNotesThunk = createAsyncThunk(
    "notes/fetchNotes",
    async ({ userId }, { getState, rejectWithValue }) => {
        try {
            const state = getState().NotesCreation;
            const { filter, lastCursor } = state;
            const limit = 8;

            // 1. Generate Appwrite queries using Query Builder
            const queries = buildAppwriteQueries({
                userId,
                filter,
                lastCursor,
                limit
            });

            // 2. Fetch records from Appwrite server
            const response = await service.getNotes(queries);

            if (!response || !response.documents) {
                throw new Error("Invalid response structure from Appwrite");
            }

            const docs = response.documents;
            const newCursor = docs.length > 0 ? docs[docs.length - 1].$id : null;
            const hasMore = docs.length === limit;

            return {
                documents: docs,
                lastCursor: newCursor,
                hasMore
            };
        } catch (error) {
            return rejectWithValue(error.message || "Failed to load notes");
        }
    },
    {
        condition: (arg, { getState }) => {
            const { NotesCreation } = getState();
            if (NotesCreation.loading) {
                return false;
            }
        }
    }
);

const NotesCreation = createSlice({
    name: "NotesCreation",
    initialState,
    reducers: {
        setNotes: notesAdapter.setAll,
        appendNotes: notesAdapter.addMany,
        addNoteToTop: (state, action) => {
            const note = action.payload;
            const id = note.$id;

            // Remove existing occurrence if any to prevent duplicates and shift to top
            state.ids = state.ids.filter(existingId => existingId !== id);

            // Unshift to the beginning of the list
            state.ids.unshift(id);
            state.entities[id] = note;
        },
        updateNoteInPlace: notesAdapter.upsertOne,
        updateNoteInSlice: notesAdapter.upsertOne,
        deleteNote: notesAdapter.removeOne,
        clearNotes: notesAdapter.removeAll,
        
        setHasMore: (state, action) => {
            state.hasMore = action.payload;
        },
        // Set specific filter criteria, clear list and cursor
        setFilters: (state, action) => {
            state.filter = {
                ...state.filter,
                ...action.payload
            };
            state.lastCursor = null;
            state.hasMore = true;
            notesAdapter.removeAll(state); // Wipe local cache to render fresh filtered results
        },
        // Restore all filters back to defaults
        resetFilters: (state) => {
            state.filter = initialFilter;
            state.lastCursor = null;
            state.hasMore = true;
            notesAdapter.removeAll(state); // Wipe local cache
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.hasMore = action.payload.hasMore;

                // If lastCursor is null, we are loading the FIRST page
                if (!state.lastCursor) {
                    notesAdapter.setAll(state, action.payload.documents);
                } else {
                    // Subsequent page load: append notes to end
                    notesAdapter.addMany(state, action.payload.documents);
                }
                // Only advance the cursor when new documents were returned,
                // otherwise keep the existing cursor to avoid re-triggering a first-page load
                if (action.payload.documents && action.payload.documents.length > 0) {
                    state.lastCursor = action.payload.lastCursor;
                }
            })
            .addCase(fetchNotesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const {
    setNotes,
    appendNotes,
    addNoteToTop,
    updateNoteInPlace,
    updateNoteInSlice,
    deleteNote,
    clearNotes,
    setHasMore,
    setFilters,
    resetFilters
} = NotesCreation.actions;

export const {
    selectAll: selectAllNotes,
    selectById: selectNoteById,
    selectIds: selectNoteIds
} = notesAdapter.getSelectors((state) => state.NotesCreation);

export default NotesCreation.reducer;