import { generateAIResponse } from "../../../AiAssistancefiles/AiResponse.js";
import { buildPrompt } from "../utils/buildPrompt.js";
import { parseAiResponse } from "../utils/parseAiResponse.js";

/**
 * Runs an AI slash command and returns the HTML ready for the editor.
 *
 * For "replace" commands (improve, grammar, rewrite, etc.) the returned HTML
 * is clean content with NO label header — it becomes the entire note.
 *
 * For "append" commands (continue, flashcards, etc.) the returned HTML
 * includes a "✦ Label" header so it's visually separated from existing content.
 *
 * @param {string} commandId    - e.g. "improve"
 * @param {string} commandLabel - e.g. "Improve Writing"
 * @param {string} commandMode  - "replace" | "append"
 * @param {string} noteText     - plain text of the full note
 * @returns {Promise<string>} HTML string
 */
const EDITOR_SYSTEM_PROMPT = `You are an expert research and knowledge assistant.

Your goal is to transform the user's query into a well-structured knowledge document that can be saved for future reference.

Adapt the structure dynamically to the topic.

Do NOT force generic sections such as Introduction, Key Concepts, Advantages, Disadvantages, or Summary.

Choose headings that best fit the subject.

Examples:

- For events: Background, Timeline, What Happened, Impact, Current Status.
- For people: Early Life, Career, Achievements, Controversies, Legacy.
- For technical topics: Overview, Core Concepts, Architecture, Examples, Best Practices.
- For comparisons: Similarities, Differences, Pros, Cons, Recommendation.
- For direct questions: Answer the question first, then provide supporting details.

Use semantic HTML:
<h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>

Return only valid HTML. No JSON. No markdown. No code blocks.`;

export function cleanHtmlResponse(text) {
  if (!text) return "";
  let clean = text.trim();

  // Strip markdown code block wrappers if the AI accidentally wraps the HTML
  clean = clean.replace(/^```html\s*/i, "");
  clean = clean.replace(/```$/g, "");
  clean = clean.replace(/```/g, "");

  return clean;
}

export async function runAiCommand(commandId, commandLabel, commandMode, noteText, onChunk = null, task = null) {
  const prompt = buildPrompt(commandId, noteText);

  if (onChunk) {
    const resultText = await generateAIResponse(
      prompt,
      (fullText) => {
        const stripped = cleanHtmlResponse(fullText);
        const parsed = parseAiResponse(stripped);
        onChunk(parsed || stripped);
      },
      false,
      null,
      EDITOR_SYSTEM_PROMPT,
      task
    );
    return cleanHtmlResponse(resultText);
  } else {
    const resultText = await generateAIResponse(prompt, null, false, null, EDITOR_SYSTEM_PROMPT, task);
    const bodyHtml = cleanHtmlResponse(resultText);

    if (commandMode === "replace") {
      // Clean content — no header, replaces the whole note
      return `<p>${bodyHtml}</p>`;
    }

    // Append mode — include labelled header to separate from existing content
    return `<p><strong style="color:#a78bfa">✦ ${commandLabel}</strong></p>${bodyHtml}<p></p>`;
  }
}
