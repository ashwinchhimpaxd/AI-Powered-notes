import React from "react";
import { ArrowCircleUpIcon } from "@phosphor-icons/react";
import { useForm } from "react-hook-form"
import { sendMessageToAI } from "@/AiAssistancefiles/Aimethods/AiassistentLogic";
import { handleError } from "@/utils/errorHandler";
import { showToast } from "@/Component/Editor/utils/showToast";

const extractStreamedTitle = (streamedText) => {
    const match = streamedText.match(/"title"\s*:\s*"([^"]*)"?/);
    return match ? match[1] : "";
};

const extractStreamedContent = (streamedText) => {
    const match = streamedText.match(/"content"\s*:\s*"([\s\S]*)/);
    if (!match) return "";

    let contentVal = match[1];

    // Strip trailing JSON structure like " or "} or }
    contentVal = contentVal.replace(/"\s*\}?\s*$/, "");

    return contentVal
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .replace(/\\t/g, "\t")
        .replace(/\\r/g, "\r");
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

            const NOTE_PATTERNS = [
                "make a note",
                "make note",
                "create notes",
                "create a notes",
                "generate notes",
                "generate a notes",
                "study notes",
                "study a notes",
                "revision notes",
                "revision a notes",
                "notes on",
                "notes on a",
                "prepare notes",
                "prepare a notes"
            ];

            const isNoteRequest = NOTE_PATTERNS.some(pattern =>
                topic.toLowerCase().includes(pattern)
            );

            const intent = isNoteRequest ? "NOTE" : "ARTICLE";


            const sanitizeJsonString = (rawStr) => {
                let inString = false;
                let result = "";
                for (let i = 0; i < rawStr.length; i++) {
                    const char = rawStr[i];
                    if (char === '"' && (i === 0 || rawStr[i - 1] !== '\\')) {
                        inString = !inString;
                        result += char;
                    } else if (inString) {
                        if (char === '\n') {
                            result += '\\n';
                        } else if (char === '\r') {
                            result += '\\r';
                        } else if (char === '\t') {
                            result += '\\t';
                        } else {
                            result += char;
                        }
                    } else {
                        result += char;
                    }
                }
                return result.trim();
            };



            // 1. Check karo ki kya user ne koi word limit mangi hai (e.g., "in 100 words", "under 200 words")
            const wordLimitMatch = topic.match(/(\d+)\s*words?/i);
            const requestedLimit = wordLimitMatch ? parseInt(wordLimitMatch[1], 10) : null;


            // 2. Dynamic instruction banayein
            const lengthInstruction = requestedLimit
                ? `CRITICAL LIMITATION: The user explicitly requested the answer to be within ${requestedLimit} words. You MUST override the long-form requirement and keep the "content" field strictly under ${requestedLimit} words. Do not give extra details.`
                : `You MUST write an EXTREMELY DETAILED, IN-DEPTH, AND COMPREHENSIVE document. Do NOT give brief summaries or short sentences. Write extensively about every aspect of the topic. Focus on information density.`;



            try {
                // 3. Ab aapka prompt aisa dikhega:

                const prompt = `Document Intent: ${intent}
                
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

Your goal is to transform the user's query into a beautifully formatted HTML knowledge document that can be saved, searched, and referenced.

CONTENT QUALITY & LENGTH RULES:
${requestedLimit
                        ? `1. STRICT WORD LIMIT: The user wants this document to be under ${requestedLimit} words. You MUST condense the information and be highly concise. Do NOT generate a long-form document.
2. Ensure the core question is answered directly and sharply within the "content" field without any fluff.`
                        : `1. Do NOT provide short answers, brief summaries, or shallow overviews.
2. Every major section should contain detailed explanations and meaningful depth.
3. Explain not only WHAT something is, but also WHY it matters, HOW it works, its implications, limitations, and real-world relevance when applicable.
4. Focus on information density, not just word count. Use concrete examples whenever they improve understanding.`
                    }

TOPIC ANALYSIS RULES (Apply if generating a comprehensive document):
1. First identify the primary subject of the query.
2. The primary subject should receive approximately 60-80% of the document's attention.
3. If the query contains years, forecasts, trends, predictions, or future outlooks: Include relevant statistics, projections, and future opportunities/risks.

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
The JSON must be valid, complete, and parseable. Do NOT truncate or leave it unfinished.
`;

                const originalHtml = editor.getHTML();
                let lastTitle = "";

                // Enforce JSON Mode (fourth parameter set to true)
                const responseText = await sendMessageToAI(
                    prompt,
                    (fullText) => {
                        const streamedContent = extractStreamedContent(fullText);
                        const streamedTitle = extractStreamedTitle(fullText) || topic;

                        if (streamedContent) {
                            if (intent === "NOTE") {
                                editor.commands.setContent(streamedContent);
                                if (setTitle && streamedTitle && streamedTitle !== lastTitle) {
                                    lastTitle = streamedTitle;
                                    setTitle(streamedTitle);
                                }
                            } else {
                                const headerHtml = `<p><strong style="color:#a78bfa">✦ AI Response: ${streamedTitle}</strong></p>`;
                                editor.commands.setContent(originalHtml + headerHtml + streamedContent);
                            }
                        }
                    },
                    true,
                    DYNAMIC_SYSTEM_PROMPT
                );

                // Extract the JSON object using regex to ignore any surrounding text or tags
                let parsedData = null;
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const rawJsonStr = jsonMatch[0];
                    const sanitizedJsonStr = sanitizeJsonString(rawJsonStr);
                    try {
                        parsedData = JSON.parse(sanitizedJsonStr);
                    } catch (parseError) {
                        console.warn("JSON.parse failed, falling back to regex extraction:", parseError);
                    }
                }

                // Fallback to regex extraction if JSON parsing failed or object is empty
                if (!parsedData || !parsedData.content) {
                    const extractedContent = extractStreamedContent(responseText);
                    const extractedTitle = extractStreamedTitle(responseText) || topic;
                    if (extractedContent) {
                        parsedData = {
                            title: extractedTitle,
                            content: extractedContent
                        };
                    }
                }

                if (!parsedData || !parsedData.content) {
                    throw new Error("No valid content found in the AI response.");
                }

                // Apply AI Response to Editor
                if (intent === "NOTE") {
                    editor.commands.setContent(parsedData.content);
                    if (setTitle && commitTitle && parsedData.title) {
                        setTitle(parsedData.title);
                        commitTitle(parsedData.title);
                    }
                } else {
                    const headerHtml = `<p><strong style="color:#a78bfa">✦ AI Response: ${parsedData.title}</strong></p>`;
                    editor.commands.setContent(originalHtml + headerHtml + parsedData.content);
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