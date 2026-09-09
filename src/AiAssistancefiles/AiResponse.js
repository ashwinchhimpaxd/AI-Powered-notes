import OpenAI from 'openai';
import AppwriteConf from "@/appwriteConfigrationKeys/ConfigrationofAppwrite";

/**
 * CENTRALIZED AI SERVICE
 * All AI-related features use this layer.
 * If changing provider/model later,
 * only modify this file.
 */

class AIService {

    constructor() {
        this.openai = new OpenAI({
            apiKey: AppwriteConf.nvidiaApiKey,
            baseURL: `${window.location.origin}/api/nvidia/v1`,
            dangerouslyAllowBrowser: true,
        });
    }

    /**
     * Standardized AI request
     * @param {string} prompt
     * @param {Function|null} onChunk  - streaming callback(fullText, newChunk)
     * @param {boolean} jsonMode       - force JSON output format
     * @param {AbortSignal|null} signal - cancellation signal
     * @param {string|null} systemPrompt - override default system prompt
     */


    async sendMessage(prompt, onChunk = null, jsonMode = false, signal = null, systemPrompt = null, task = null) {

        const config = {
            chat: {
                max_tokens: 1200,
                temperature: 0.3,
            },

            note: {
                max_tokens: 1800,
                temperature: 0.2,
            },

            summarize: {
                max_tokens: 1000,
                temperature: 0.2,
            },

            complex: {
                max_tokens: 4096,
                temperature: 0.5,
            },
        };
        const settings = config[task] || config["chat"];
        try {
            const messages = [
                {
                    role: "system",
                    content: systemPrompt ||
                        `You are a helpful AI notes assistant.

When the user explicitly asks you to create a note,
output it using this exact syntax:

[CREATE_NOTE]
{
"title": "The Note Title",
"content": "HTML formatted note content"
}
[/CREATE_NOTE]

Rules:
- No markdown code blocks
- Keep notes clean and structured
- Use proper HTML formatting
- Be concise and readable`
                },
                { role: "user", content: prompt }
            ];

            const isStreaming = !!onChunk;

            /**
             * NVIDIA API Payload (OpenAI-compatible format)
             */

            const requestParams = {
                model: "nvidia/nemotron-3-super-120b-a12b",
                messages,
                max_tokens: settings.max_tokens || config["note"].max_tokens,
                temperature: settings.temperature || config["note"].temperature,    // NVIDIA recommended for deepseek-v4-pro
                top_p: 1,       // NVIDIA recommended for deepseek-v4-pro
                // seed: 42,
                stream: isStreaming,
            };

            if (jsonMode) {
                requestParams.response_format = { type: "json_object" };
            }

            /**
             * STREAMING RESPONSE
             */

            if (isStreaming) {

                const stream = await this.openai.chat.completions.create(
                    requestParams,
                    { signal }
                );

                let fullText = "";
                let buffer = "";
                let lastUpdate = 0;

                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (!content) continue;
                    fullText += content;
                    buffer += content;
                    const now = performance.now();

                    if (now - lastUpdate > 50) {
                        onChunk(fullText, buffer);
                        buffer = "";
                        lastUpdate = now;
                    }
                }
                if (buffer) {
                    onChunk(fullText, buffer);
                }

                return fullText;
            }

            /**
             * NORMAL RESPONSE (non-streaming)
             */
            else {

                const completion = await this.openai.chat.completions.create(
                    requestParams,
                    { signal }
                );
                return completion.choices[0]?.message?.content || "";
            }
        } catch (error) {

            // Handle AbortController / OpenAI SDK cancellation
            if (
                error?.name === "AbortError" ||
                error?.name === "APIUserAbortError" ||
                error?.code === "ERR_CANCELED"
            ) {
                const cancelError = new Error("canceled");
                cancelError.name = "CanceledError";
                cancelError.code = "ERR_CANCELED";
                throw cancelError;
            }
            console.log(error)
            console.error("AI Service Error:", error?.message || error);

            // OpenAI SDK exposes status directly on the error object
            let status = error?.status;
            let originalMsg = error?.message || "";

            let cleanMsg = "Failed to communicate with AI.";
            if (status) {
                if (status === 400) {
                    cleanMsg = "Invalid request to AI service.";
                } else if (status === 401) {
                    cleanMsg = "Authentication failed. Please verify your AI API key.";
                } else if (status === 429) {
                    cleanMsg = "AI rate limit reached. Please wait a moment and try again.";
                } else if (status >= 500) {
                    cleanMsg = "AI service is temporarily unavailable. Please try again later.";
                }
            } else {
                if (originalMsg.toLowerCase().includes("network")) {
                    cleanMsg = "Network error. Check your internet connection.";
                }
            }

            const cleanError = new Error(cleanMsg);
            if (status) cleanError.status = status;
            throw cleanError;
        }
    }
}

const aiService = new AIService();

/**
 * Main Export
 * Entire app uses this function only
 */

export const generateAIResponse = (prompt, onChunk, jsonMode = false, signal = null, systemPrompt = null, task = null,) => {
    return aiService.sendMessage(
        prompt,
        onChunk,
        jsonMode,
        signal,
        systemPrompt,
        task
    );
};
