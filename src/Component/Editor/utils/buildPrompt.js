/**
 * Builds the Gemini prompt string for a given AI slash command.
 * @param {string} commandId  - the command id (e.g. "improve")
 * @param {string} noteText   - plain text content of the note
 * @returns {string} the full prompt to send to Gemini
 */
export function buildPrompt(commandId, noteText) {

  const t = (noteText || "(empty note)").replace(/<img[^>]*>/gi, "").trim().slice(0, 3000);

  const map = {
    improve: `Improve the writing clarity and flow of the following text. Return ONLY the improved text:\n\n${t}`,
    rewrite: `Rewrite the following text in a professional, formal tone. Return ONLY the rewritten text:\n\n${t}`,
    shorten: `Shorten the following text while keeping all key information. Return ONLY the shortened version:\n\n${t}`,
    expand: `Expand the following text with more detail and context. Return ONLY the expanded text:\n\n${t}`,
    continue: `Continue writing naturally after the following text. Write 2-4 follow-up paragraphs. Return ONLY the continuation:\n\n${t}`,
    notes: `Extract the most important notes and takeaways from the following text. Return ONLY a valid HTML unordered list using <ul> and <li> tags. Each point must be a separate <li> item. Do NOT use bullet characters (•) or dashes.\n\n${t}`,
    related: `Based on the following text, suggest 6 related topics to explore. Return ONLY a valid HTML unordered list using <ul> and <li> tags. Each topic must be a separate <li> item. Do NOT use bullet characters (•) or dashes.\n\n${t}`,
    explain: `Explain the following text in simple, beginner-friendly language. Return ONLY the explanation using <p> and <ul><li> tags for structure:\n\n${t}`,
    bullets: `Convert the following text into a clean bullet-point list. Return ONLY a valid HTML unordered list using <ul> and <li> tags. Each point must be a separate <li> item. Do NOT use bullet characters (•) or dashes (-):\n\n${t}`,
    summarize: `Summarize the following text in 3-5 sentences. Return ONLY the summary:\n\n${t}`,
    grammar: `Fix all grammar, spelling and punctuation in the following text. Return ONLY the corrected text:\n\n${t}`,
    tone: `Rewrite the following text in a friendly, conversational tone. Return ONLY the rewritten text:\n\n${t}`,
    simplify: `Simplify the language so it is easy for anyone to understand. Use short sentences. Return ONLY the simplified text:\n\n${t}`,
    flashcards: `Create 5 flashcard Q&A pairs from the following text. Format each as:\nQ: [question]\nA: [answer]\n\nReturn ONLY the flashcards:\n\n${t}`,
    studynotes: `Create structured study notes from the following text with clear headings and bullet points. Return ONLY the study notes:\n\n${t}`,
    conclusion: `Write a strong concluding paragraph for the following text. Return ONLY the conclusion:\n\n${t}`,
    title: `Suggest 5 creative, descriptive titles for a note with the following content. Return ONLY a numbered list:\n\n${t}`,
    actions: `Extract all action items and to-dos from the following text. Return ONLY a valid HTML ordered list using <ol> and <li> tags. Each action must be a separate <li> item. Do NOT use numbers with dots or bullet characters:\n\n${t}`,
    quiz: `Generate 5 multiple-choice quiz questions from the following text. Include 4 options (A-D) and mark the correct answer. Return ONLY the quiz:\n\n${t}`,
    translate: `Translate the following text to Spanish. Return ONLY the translation:\n\n${t}`,
    examples: `Generate 3-5 real-world examples illustrating concepts in the following text as a numbered list. Return ONLY the examples:\n\n${t}`,
  };

  return map[commandId] || `Process the following note:\n\n${t}`;
}
