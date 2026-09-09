import { generateAIResponse } from "../AiResponse";

/**
 * Standard interface for sending messages to AI.
 * This file is now loosely coupled to the AI provider.
 */
export const sendMessageToAI = async (usermessage, chatHistoryOrOnChunk = [], onChunkOrJsonMode = null, jsonModeOrSystemPrompt = false, systemPrompt = null) => {
    let onChunk = null;
    let jsonMode = false;
    let finalSystemPrompt = null;

    if (typeof chatHistoryOrOnChunk === "function") {
        onChunk = chatHistoryOrOnChunk;
        jsonMode = !!onChunkOrJsonMode;
        finalSystemPrompt = jsonModeOrSystemPrompt || null;
    } else {
        onChunk = onChunkOrJsonMode;
        jsonMode = !!jsonModeOrSystemPrompt;
        finalSystemPrompt = systemPrompt || null;
    }

    try {
        if (!usermessage) {
            throw new Error("Message is required");
        }
        // We pass this directly to the abstraction layer (without history parameter)
        const responseText = await generateAIResponse(usermessage, onChunk, jsonMode, null, finalSystemPrompt);
        return responseText;

    } catch (error) {
        console.error("AI Error:", error);
        throw error;
    }
}
