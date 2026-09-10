// api/nvidia.js — Vercel Serverless Function
// Ye function NVIDIA API ke saath proxy ka kaam karta hai
// Authorization header properly forward karta hai

export default async function handler(req, res) {
  // CORS headers — frontend se request allow karo
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Preflight OPTIONS request handle karo
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const NVIDIA_API_KEY = process.env.VITE_NVIDIA_API_KEY;

  if (!NVIDIA_API_KEY) {
    return res.status(500).json({ error: "NVIDIA API key not configured on server." });
  }

  // Request URL ka path nikalo — /api/nvidia/v1/chat/completions se v1/chat/completions banta hai
  const url = req.url; // e.g., /api/nvidia/v1/chat/completions
  // "v1/..." part extract karo
  const nvidiaPath = url.replace(/^\/api\/nvidia\//, "");

  const targetUrl = `https://integrate.api.nvidia.com/${nvidiaPath}`;

  try {
    const nvidiaResponse = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
      },
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
    });

    // Streaming response handle karo
    const contentType = nvidiaResponse.headers.get("content-type") || "";
    res.setHeader("Content-Type", contentType);
    res.status(nvidiaResponse.status);

    // Stream body directly forward karo
    const reader = nvidiaResponse.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (error) {
    console.error("NVIDIA proxy error:", error);
    res.status(502).json({ error: "Failed to reach NVIDIA API.", details: error.message });
  }
}
