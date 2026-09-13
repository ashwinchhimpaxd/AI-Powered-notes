import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { MagnifyingGlass, Sparkle } from "@phosphor-icons/react";
import { sendMessageToAI } from "../../AiAssistancefiles/Aimethods/AiassistentLogic.js";
import service from "@/AppWrite/Setgetuserdatas/config.js";
import { handleError } from "../../utils/errorHandler.js";
import { addNoteToTop } from "../../redux/NotesCreation/NotesCreationSlice.js";
import { showToast } from "../Editor/utils/showToast.js";

/**
 * Extracts the title from a partial / complete JSON-like AI response.
 * Works even if the JSON is malformed.
 */
const extractStreamedTitle = (streamedText) => {
    const match = streamedText.match(/"title"\s*:\s*"([^"]*?)"/);
    return match ? match[1].trim() : "";
};

/**
 * Extracts the HTML content value from a partial / complete JSON-like AI response.
 * Falls back gracefully when the JSON is incomplete or malformed.
 */
const extractStreamedContent = (streamedText) => {
    // Try to find content field
    const match = streamedText.match(/"content"\s*:\s*"([\s\S]*)/);
    if (!match) return "";
    let contentVal = match[1];
    // Strip trailing JSON structure (closing quote / brace)
    contentVal = contentVal.replace(/"\s*\}?\s*$/, "");
    return contentVal
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .replace(/\\t/g, "\t")
        .replace(/\\r/g, "\r");
};

/**
 * Robust multi-strategy parser for AI JSON responses.
 *
 * Strategy 1: Direct JSON.parse (fast path — works most of the time)
 * Strategy 2: Sanitize bare control characters inside strings, then parse
 * Strategy 3: Pure regex extraction (works even when JSON is fully broken)
 *
 * @param {string} raw - Raw string returned by the AI model
 * @param {string} fallbackTitle - Title to use when extraction fails
 * @returns {{ title: string, content: string } | null}
 */
const robustParseAiJson = (raw, fallbackTitle = "") => {
    if (!raw || typeof raw !== "string") return null;

    // ── Strategy 1: direct parse ──────────────────────────────────────────
    const jsonBlock = raw.match(/\{[\s\S]*\}/);
    if (jsonBlock) {
        try {
            const parsed = JSON.parse(jsonBlock[0]);
            if (parsed && parsed.content) return parsed;
        } catch { /* fall through */ }
    }

    // ── Strategy 2: sanitize bare newlines/tabs inside strings, then parse ─
    if (jsonBlock) {
        try {
            let sanitized = "";
            let inStr = false;
            let escaped = false;
            for (let i = 0; i < jsonBlock[0].length; i++) {
                const ch = jsonBlock[0][i];
                if (escaped) {
                    sanitized += ch;
                    escaped = false;
                    continue;
                }
                if (ch === "\\") { escaped = true; sanitized += ch; continue; }
                if (ch === '"') { inStr = !inStr; sanitized += ch; continue; }
                if (inStr) {
                    if (ch === "\n") { sanitized += "\\n"; continue; }
                    if (ch === "\r") { sanitized += "\\r"; continue; }
                    if (ch === "\t") { sanitized += "\\t"; continue; }
                }
                sanitized += ch;
            }
            const parsed = JSON.parse(sanitized);
            if (parsed && parsed.content) return parsed;
        } catch { /* fall through */ }
    }

    // ── Strategy 3: regex extraction (JSON is too broken to parse) ────────
    const titleMatch = raw.match(/"title"\s*:\s*"([^"]*?)"/);
    const contentMatch = raw.match(/"content"\s*:\s*"([\s\S]*)/);
    if (contentMatch) {
        let contentVal = contentMatch[1].replace(/"\s*\}?\s*$/, "");
        contentVal = contentVal
            .replace(/\\n/g, "\n")
            .replace(/\\"/g, '"')
            .replace(/\\t/g, "\t")
            .replace(/\\r/g, "\r");
        if (contentVal.trim()) {
            return {
                title: titleMatch ? titleMatch[1] : fallbackTitle,
                content: contentVal.trim(),
            };
        }
    }

    // ── Last resort: if the whole response looks like HTML, use it ─────────
    const trimmed = raw.trim();
    if (/<[a-z][\s\S]*>/i.test(trimmed)) {
        return { title: fallbackTitle, content: trimmed };
    }

    return null;
};

export default function SearchBarAndAutoNotes({ onSearchChange, setIsCreatingNote }) {
    const dispatch = useDispatch();
    const userData = useSelector((state) => state.UserAuthantication.UserData);

    const [searchQuery, setSearchQuery] = useState("");
    const [isAiMode, setIsAiMode] = useState(false);
    const [slideText, setSlideText] = useState("");
    const [showSlideText, setShowSlideText] = useState(false);

    const debounceTimerRef = useRef(null);

    const debouncedSearchChange = useCallback((query) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            onSearchChange(query);
        }, 300);
    }, [onSearchChange]);

    // Handle input query change
    const handleSearchQueryChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (!isAiMode) {
            debouncedSearchChange(val);
        }
    };

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    // Handle AI Toggle
    const handleToggleAiMode = () => {
        const newMode = !isAiMode;
        setIsAiMode(newMode);
        setSlideText(newMode ? "AI mode ON" : "AI mode OFF");
        setShowSlideText(true);

        // Sync change immediately to parent
        if (newMode) {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            onSearchChange("");
        } else {
            onSearchChange(searchQuery);
        }

        // Hide slide text after a short delay
        setTimeout(() => {
            setShowSlideText(false);
        }, 2500);
    };

    // Handle AI Note Generation on Enter
    const handleSearchKeyDown = async (e) => {
        if (e.key === 'Enter' && isAiMode && searchQuery.trim() !== '') {
            e.preventDefault();
            const topic = searchQuery.trim();
            setSearchQuery("");
            setIsCreatingNote(true);

            // ── Detect what length the user actually wants ──────────────────────
            // Tier 1: explicit word count (e.g. "in 100 words")
            const wordLimitMatch = topic.match(/(\d+)\s*words?/i);
            const requestedLimit = wordLimitMatch ? parseInt(wordLimitMatch[1], 10) : null;

            // Tier 2: short/brief/quick/summary/overview keywords
            const wantsShort = !requestedLimit && /\b(short|brief|quick|summary|overview|concise|simple|small)\b/i.test(topic);

            const lengthInstruction = requestedLimit
                ? `WORD LIMIT: Keep the entire "content" field strictly under ${requestedLimit} words. Be concise and direct.`
                : wantsShort
                ? `LENGTH: The user wants a SHORT, CONCISE response. Provide a focused overview — do NOT write a long-form document. Keep it brief and to the point.`
                : `LENGTH: Write a detailed, well-structured document. Cover the topic thoroughly with meaningful depth.`;


            try {
                const prompt = `
                ${lengthInstruction}
                
                Adapt the structure dynamically to the subject instead of using a fixed template.
                Choose section headings that naturally fit the topic.

                Examples:
                * Events → Background, Timeline, What Happened, Impact, Current Status
                * People → Overview, Early Life, Career, Achievements, Controversies
                * Technical Topics → Overview, Core Concepts, Architecture, Examples, Best Practices
                * Direct Questions → Answer the question first, then provide supporting details
                * Comparisons → Similarities, Differences, Pros, Cons, Recommendation

                Formatting Requirements (STRICTLY ENFORCED):
                * You MUST use HTML tags. Plain text will be rejected.
                * Every main section heading MUST be wrapped in <h2> tags.
                * Every subsection heading MUST be wrapped in <h3> tags.
                * Use <p> for long, detailed paragraphs.
                * Use <ul>, <ol>, and <li> where lists improve readability.
                * You MUST heavily use <strong> to highlight important concepts, terms, names, or key facts.
                * Do NOT use Markdown formatting (no ** or #).
                * Do NOT force unnecessary sections unless they are genuinely useful.

                Return ONLY a raw valid JSON object with exactly two keys:

                "title": A concise and accurate title.

                "content": Highly detailed HTML formatted content suitable for long-term storage and reading.

                No markdown code blocks (e.g. no \`\`\`json).
                No conversational text.
                No explanations outside JSON.

                User Query:
                ${topic}
                `;


                const DASHBOARD_CREATE_SYSTEM_PROMPT = `You are an expert research, analysis, and knowledge assistant.

Your goal is to transform the user's query into a well-formatted HTML knowledge document that can be saved and referenced.

CONTENT LENGTH RULES:
${requestedLimit
                        ? `- STRICT WORD LIMIT: Keep the content under ${requestedLimit} words. Be direct and concise.`
                        : wantsShort
                        ? `- The user explicitly requested a SHORT response. Do NOT write a long-form document. Provide a focused, concise answer.`
                        : `- Write a detailed document with meaningful depth. Avoid filler. Focus on information density.`
                    }

TOPIC ANALYSIS:
1. Identify the primary subject and give it 60-80% of the document's attention.
2. If the query involves trends, forecasts, or future outlooks: include relevant statistics and projections.
3. Use concrete examples to improve understanding.

STRUCTURE RULES:

1. Organize information using a logical hierarchy.
2. Use semantic HTML only.
3. Use <h2> for major sections.
4. Use <h3> for subsections.
5. Use <p> for detailed explanations.
6. Use <ul>, <ol>, and <li> when lists improve readability.
7. Use <strong> to highlight important concepts, terminology, names, statistics, facts, and conclusions.
8. Avoid unnecessary sections that do not contribute meaningful information.

FORMATTING RULES:

1. Never use Markdown.
2. Never use code fences.
3. Never include conversational text.
4. Never explain what you are doing.
5. Never include text outside the required JSON object.

OUTPUT REQUIREMENTS:

Return ONLY a RAW, VALID JSON object with exactly the following structure:

{
"title": "A concise and accurate title",
"content": "The complete HTML formatted document"
}

The JSON must be valid and parseable.

Do NOT wrap the JSON in markdown blocks.

Return ONLY the JSON object.
`;

                // Enforce JSON Mode (fourth parameter set to true)
                const responseText = await sendMessageToAI(prompt, [], null, true, DASHBOARD_CREATE_SYSTEM_PROMPT, wantsShort ? "generateShort" : "generateLong");


                // Robust multi-strategy parse — handles malformed/HTML-embedded JSON
                const parsedData = robustParseAiJson(responseText, topic);

                if (!parsedData || !parsedData.content) {
                    throw new Error("No valid content found in the AI response.");
                }

                if (parsedData.title && parsedData.content) {
                    const userId = userData?.userdetaild?.userId ||
                        userData?.userdetaild?.$id ||
                        userData?.userId ||
                        userData?.$id ||
                        "anonymous";

                    const cleanTitle = parsedData.title.trim().replace(/\s+/g, " ");
                    const generatedSlug = cleanTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

                    const newNoteResponse = await service.createNote({
                        Notes_title: parsedData.title,
                        slug: generatedSlug,
                        Notes_contents: parsedData.content,
                        notes_images: [],
                        Is_note_important: false,
                        User_Unique_ID: userId,
                    });

                    if (newNoteResponse && newNoteResponse.$id) {
                        dispatch(addNoteToTop(newNoteResponse));
                        showToast("ai_success", "Note created");
                    }
                }
            } catch (error) {
                handleError(error, { action: "generating AI note" });
            } finally {
                setIsCreatingNote(false);
            }
        }
    };

    return (
        <div className="relative flex items-center flex-1 md:flex-none">
            {/* Sliding Text Animation */}
            <div
                className={`hidden md:block absolute left-full ml-4 whitespace-nowrap text-sm font-semibold transition-all duration-500 ease-out z-0
                    ${showSlideText ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}
                    ${isAiMode ? 'text-purple-400' : 'text-muted-foreground'}
                `}
            >
                {slideText}
            </div>

            {/* Responsive Search Bar */}
            <div className="relative flex items-center h-11 w-full md:w-md rounded-xl bg-card border border-border focus-within:border-[#8b5cf6] transition-colors z-10 shadow-lg">
                <div className="pl-4 pr-2 flex items-center pointer-events-none">
                    <MagnifyingGlass className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                    type="text"
                    spellCheck="false"
                    className="w-full h-full bg-transparent text-foreground text-sm focus:outline-none placeholder:text-muted-foreground/50 placeholder:transition-all"
                    placeholder={isAiMode ? "give topic & make note automatically" : "Search or ask your notes..."}
                    value={searchQuery}
                    onChange={handleSearchQueryChange}
                    onKeyDown={handleSearchKeyDown}
                />
                <div className="pr-4 pl-2 flex items-center gap-3">
                    <Sparkle weight="fill" className={`size-4 transition-colors ${isAiMode ? 'text-[#8b5cf6]' : 'text-muted-foreground/50'}`} />
                    {/* Toggle Switch */}
                    <button
                        type="button"
                        onClick={handleToggleAiMode}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isAiMode ? 'bg-[#8b5cf6]' : 'bg-muted'}`}
                        aria-label="Toggle AI Mode"
                    >
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAiMode ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
}