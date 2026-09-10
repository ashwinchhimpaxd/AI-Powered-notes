/**
 * CENTRALIZED AI SERVICE
 * All AI-related features use this layer.
 *
 * Browser -> Vercel API -> NVIDIA
 *
 * NVIDIA API key NEVER comes to browser.
 */

class AIService {

    constructor() {
        this.baseURL = `${window.location.origin}/api/nvidia`;
    }

    async sendMessage(
        prompt,
        onChunk = null,
        jsonMode = false,
        signal = null,
        systemPrompt = null,
        task = null
    ) {

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

        const settings = config[task] || config.chat;

        try {

            const messages = [
                {
                    role: "system",
                    content:
                        systemPrompt ||
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

                {
                    role: "user",
                    content: prompt
                }
            ];

            const isStreaming = !!onChunk;

            const requestParams = {
                model: "nvidia/nemotron-3-super-120b-a12b",
                messages,
                max_tokens: settings.max_tokens,
                temperature: settings.temperature,
                top_p: 1,
                stream: isStreaming,
            };

            if (jsonMode) {
                requestParams.response_format = {
                    type: "json_object"
                };
            }

            const response = await fetch(
                this.baseURL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify(requestParams),

                    signal,
                }
            );

            if (!response.ok) {

                let errorData;

                try {
                    errorData = await response.json();
                } catch {
                    errorData = null;
                }

                const status = response.status;

                console.error(
                    "NVIDIA API Error:",
                    errorData
                );

                let cleanMsg =
                    "Failed to communicate with AI.";

                if (status === 400) {
                    cleanMsg =
                        "Invalid request to AI service.";
                }
                else if (status === 401) {
                    cleanMsg =
                        "Authentication failed. Please verify your AI API key.";
                }
                else if (status === 429) {
                    cleanMsg =
                        "AI rate limit reached. Please wait a moment and try again.";
                }
                else if (status >= 500) {
                    cleanMsg =
                        "AI service is temporarily unavailable. Please try again later.";
                }

                const error = new Error(cleanMsg);
                error.status = status;

                throw error;
            }

            // ============================================
            // NORMAL RESPONSE
            // ============================================

            if (!isStreaming) {

                const data = await response.json();

                return (
                    data.choices?.[0]?.message?.content ||
                    ""
                );
            }

            // ============================================
            // STREAMING RESPONSE
            // ============================================

            const reader = response.body.getReader();

            const decoder = new TextDecoder();

            let fullText = "";
            let buffer = "";
            let lastUpdate = 0;

            while (true) {

                const { done, value } =
                    await reader.read();

                if (done) break;

                buffer += decoder.decode(
                    value,
                    { stream: true }
                );

                const lines = buffer.split("\n");

                buffer = lines.pop() || "";

                for (const line of lines) {

                    const trimmed = line.trim();

                    if (!trimmed) continue;

                    if (!trimmed.startsWith("data:")) {
                        continue;
                    }

                    const data =
                        trimmed.slice(5).trim();

                    if (data === "[DONE]") {
                        continue;
                    }

                    try {

                        const parsed =
                            JSON.parse(data);

                        const content =
                            parsed.choices?.[0]
                                ?.delta?.content || "";

                        if (!content) continue;

                        fullText += content;

                        const now = performance.now();

                        if (now - lastUpdate > 50) {

                            onChunk(
                                fullText,
                                content
                            );

                            lastUpdate = now;
                        }

                    } catch (error) {

                        console.warn(
                            "Stream chunk parse error:",
                            data
                        );
                    }
                }
            }

            if (fullText) {
                onChunk(fullText, "");
            }

            return fullText;

        } catch (error) {

            if (
                error?.name === "AbortError"
            ) {

                const cancelError =
                    new Error("canceled");

                cancelError.name =
                    "CanceledError";

                cancelError.code =
                    "ERR_CANCELED";

                throw cancelError;
            }

            console.error(
                "AI Service Error:",
                error
            );

            throw error;
        }
    }
}

const aiService = new AIService();

/**
 * Main Export
 */

export const generateAIResponse = (
    prompt,
    onChunk,
    jsonMode = false,
    signal = null,
    systemPrompt = null,
    task = null
) => {

    return aiService.sendMessage(
        prompt,
        onChunk,
        jsonMode,
        signal,
        systemPrompt,
        task
    );
};

export default aiService;