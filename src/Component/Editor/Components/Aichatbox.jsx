import React from "react";
import { ArrowCircleUpIcon } from "@phosphor-icons/react";
import { useForm } from "react-hook-form"
import { sendMessageToAI } from "@/AiAssistancefiles/Aimethods/AiassistentLogic";
import { handleError } from "@/utils/errorHandler";
import { showToast } from "@/Component/Editor/utils/showToast";

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
 * Last resort: treat the whole response as raw HTML content
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
                if (escaped) { sanitized += ch; escaped = false; continue; }
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

function Aichatbox({ editor, onClose, setLoading, setStatus, setTitle, commitTitle }) {

    const {
        register,
        handleSubmit,
        watch,
        setValue,
    } = useForm()

    const quickaichat = async () => {
        if (watch("aiquickchat").trim() !== '') {
            const topic = watch("aiquickchat").trim();

            // 1. Immediately empty the input
            setValue("aiquickchat", "");

            // 2. Immediately close the chat box
            if (onClose) onClose();

            // 3. Immediately show the loading state
            if (setLoading) setLoading(true);
            if (setStatus) setStatus(`Generating content for "${topic}"...`);


            // ── Detect what length the user actually wants ──────────────────────
            // Tier 1: explicit word count (e.g. "in 100 words", "under 50 words")
            const wordLimitMatch = topic.match(/(\d+)\s*words?/i);
            const requestedLimit = wordLimitMatch ? parseInt(wordLimitMatch[1], 10) : null;

            // Tier 2: short/brief/quick/summary/overview keywords
            const wantsShort = !requestedLimit && /\b(short|brief|quick|summary|overview|concise|simple|small)\b/i.test(topic);

            // Build the length instruction that goes into the USER prompt
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

                Examples if writing a long document:
                * Events → Background, Timeline, What Happened, Impact, Current Status
                * People → Overview, Early Life, Career, Achievements, Controversies
                * Technical Topics → Overview, Core Concepts, Architecture, Examples, Best Practices
                * Direct Questions → Answer the question first, then provide supporting details
                * Comparisons → Similarities, Differences, Pros, Cons, Recommendation

                Formatting Requirements (STRICTLY ENFORCED):
                * You MUST use HTML tags. Plain text will be rejected.
                * Every main section heading MUST be wrapped in <h2> tags. (Skip or keep minimal if a short response is requested).
                * Every subsection heading MUST be wrapped in <h3> tags.
                * Use <p> for detailed paragraphs.
                * Use <ul>, <ol>, and <li> where lists improve readability.
                * You MUST heavily use <strong> to highlight important concepts, terms, names, or key facts.
                * Do NOT use Markdown formatting (no ** or #).
                * Do NOT force unnecessary sections unless they are genuinely useful.

                Return ONLY a raw valid JSON object with exactly two keys:

                "title": A concise and accurate title.

                "content": HTML formatted content suitable for storage and reading, strictly respecting any user-requested word limits.

                No markdown code blocks (e.g. no \`\`\`json).
                No conversational text.
                No explanations outside JSON.

                User Query:
                ${topic}
                `;

                let DYNAMIC_SYSTEM_PROMPT = `You are an expert research, analysis, and knowledge assistant.

Your goal is to transform the user's query into a well-formatted HTML knowledge document.

CONTENT LENGTH RULES:
${requestedLimit
                        ? `- STRICT WORD LIMIT: Keep the content under ${requestedLimit} words. Be direct and concise.`
                        : wantsShort
                            ? `- The user explicitly requested a SHORT response. Do NOT write a long-form document. Provide a focused, concise answer.`
                            : `- Write a detailed document with meaningful depth. Cover the topic thoroughly.`
                    }

TOPIC ANALYSIS:
1. Identify the primary subject and give it 60-80% of the document's attention.
2. If the query involves trends, forecasts, or future outlooks: include relevant statistics and projections.


STRUCTURE & FORMATTING RULES:
1. Organize information using a logical hierarchy. Use semantic HTML only.
2. Use <h2> for major sections, <h3> for subsections, and <p> for detailed explanations.
3. Use <ul>, <ol>, and <li> when lists improve readability.
4. Use <strong> to highlight important concepts, terminology, names, statistics, facts, and conclusions.
5. Never use Markdown or code fences (\`\`\`json).
6. Never include conversational text or explanations outside the required JSON object.

OUTPUT REQUIREMENTS:
Return ONLY a RAW, VALID JSON object with exactly the following structure:
{
"title": "A concise and accurate title",
"content": "The complete HTML formatted document"
}
The JSON must be valid, complete, and parseable. Do NOT truncate or leave it unfinished.`;

                let lastTitle = "";

                const responseText = await sendMessageToAI(
                    prompt,
                    (fullText) => {
                        const streamedContent = extractStreamedContent(fullText);
                        const streamedTitle = extractStreamedTitle(fullText) || topic;

                        if (streamedContent) {
                            // Always replace editor content and update title
                            editor.commands.setContent(streamedContent);
                            if (setTitle && streamedTitle && streamedTitle !== lastTitle) {
                                lastTitle = streamedTitle;
                                setTitle(streamedTitle);
                            }
                        }
                    },
                    true,
                    DYNAMIC_SYSTEM_PROMPT,
                    wantsShort ? "generateShort" : "generateLong"
                );
                // console.log("data before pased:", responseText)

                // Robust multi-strategy parse — handles malformed/HTML-embedded JSON
                const parsedData = robustParseAiJson(responseText, topic);
                // console.log("data after parsed: ", parsedData)

                if (!parsedData || !parsedData.content) {
                    throw new Error("No valid content found in the AI response.");
                }

                // Always replace editor content and update title
                editor.commands.setContent(parsedData.content);
                if (setTitle && commitTitle && parsedData.title) {
                    setTitle(parsedData.title);
                    commitTitle(parsedData.title);
                }

                showToast("success", "AI response applied successfully!");

            } catch (error) {
                handleError(error, { action: "generating AI note" });
                // showToast("error", "Something went wrong while generating AI response.");
            } finally {
                if (setLoading) setLoading(false);
                if (setStatus) setStatus("");
            }
        }
    };

    return (
        <div className="ai-chat-content h-full flex flex-col ">


            {/* Input Area */}
            <div className="p-3 relative h-full flex flex-col justify-center pb-3">
                {/* Validation Error Message */}

                <div className="flex items-end gap-2">
                    <form onSubmit={handleSubmit(quickaichat)}
                        className=" w-full h-full flex items-center">

                        <input
                            autoComplete="off"
                            {...register('aiquickchat',)}
                            placeholder="Ask AI..."
                            rows={1}
                            className="
                        flex-1
                        resize-none
                        rounded-xl
                        px-4
                        py-3
                        outline-none
                        text-[1.1rem]
                        text-foreground
                        h-full
                        overflow-y-scroll
                        "
                        />


                        <button type="submit"
                            className="
                                        p-3
                                        rounded-NPMxl
                                        text-sm
                                        font-medium
                                        transition
                                        cursor-pointer
                                        text-primary
                                        "
                            aria-label="Send message"
                        >
                            <ArrowCircleUpIcon size={30} weight="fill" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Aichatbox;