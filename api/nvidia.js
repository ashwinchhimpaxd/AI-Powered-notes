export default async function handler(req, res) {
    try {
        const apiKey = process.env.NVIDIA_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "NVIDIA_API_KEY is not configured"
            });
        }

        const response = await fetch(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },

                body: JSON.stringify(req.body),
            }
        );

        res.status(response.status);

        const contentType =
            response.headers.get("content-type");

        if (contentType) {
            res.setHeader("Content-Type", contentType);
        }

        // Streaming response
        if (contentType?.includes("text/event-stream")) {

            res.setHeader(
                "Cache-Control",
                "no-cache, no-transform"
            );

            const reader = response.body.getReader();

            while (true) {
                const { done, value } =
                    await reader.read();

                if (done) break;

                res.write(Buffer.from(value));
            }

            res.end();
            return;
        }

        const data = await response.text();

        res.send(data);

    } catch (error) {

        console.error("NVIDIA Proxy Error:", error);

        return res.status(500).json({
            error: "Failed to communicate with NVIDIA API"
        });
    }
}