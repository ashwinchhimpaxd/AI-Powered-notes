export default async function handler(req, res) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "GEMINI_API_KEY is not configured"
            });
        }

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
            {
                method: req.method || "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },

                body: req.method === "POST" ? JSON.stringify(req.body) : undefined,
            }
        );

        res.status(response.status);

        const contentType = response.headers.get("content-type");

        if (contentType) {
            res.setHeader("Content-Type", contentType);
        }

        // Handle streaming response
        if (contentType?.includes("text/event-stream")) {
            res.setHeader(
                "Cache-Control",
                "no-cache, no-transform"
            );

            const reader = response.body.getReader();

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                res.write(Buffer.from(value));
            }

            res.end();
            return;
        }

        // Handle standard response
        const data = await response.text();
        res.send(data);

    } catch (error) {
        console.error("Gemini Proxy Error:", error);

        return res.status(500).json({
            error: "Failed to communicate with Gemini API"
        });
    }
}
