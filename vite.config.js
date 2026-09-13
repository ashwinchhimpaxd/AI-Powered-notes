import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
// Function form lets us access env vars (including non-VITE_ ones like NVIDIA_API_KEY)
// in the proxy config — they are NEVER sent to the browser bundle.
export default defineConfig(({ mode }) => {
  // Load ALL env vars (prefix '' = no filter), so NVIDIA_API_KEY is available here
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        // Intercepts AiResponse.js calls → /api/nvidia
        // Forwards to NVIDIA with the API key injected server-side.
        // Production uses api/nvidia.js (Vercel serverless) — same logic.
        '/api/nvidia': {
          target: 'https://integrate.api.nvidia.com',
          changeOrigin: true,
          secure: true,
          // /api/nvidia  →  /v1/chat/completions
          rewrite: (path) => path.replace(/^\/api\/nvidia/, '/v1/chat/completions'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (env.NVIDIA_API_KEY) {
                proxyReq.setHeader('Authorization', `Bearer ${env.NVIDIA_API_KEY}`)
              } else {
                console.warn('[NVIDIA proxy] NVIDIA_API_KEY not found in .env')
              }
            })
            proxy.on('error', (err) => console.error('[NVIDIA proxy error]', err))
          },
        },
      },
    },
    theme: {
      extend: {
        colors: {
          'primarytextcolor': 'rgba(var(--primary-text-color))',
        }
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})

