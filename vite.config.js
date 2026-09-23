import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss()
    ],

    server: {
      proxy: {

        '/api/gemini': {

          target:
            'https://generativelanguage.googleapis.com',

          changeOrigin: true,
          secure: true,

          rewrite: (path) =>
            path.replace(
              /^\/api\/gemini/,
              '/v1beta/openai/chat/completions'
            ),

          configure: (proxy) => {

            proxy.on('proxyReq', (proxyReq) => {

              if (env.GEMINI_API_KEY) {

                proxyReq.setHeader(
                  'Authorization',
                  `Bearer ${env.GEMINI_API_KEY}`
                )

              } else {

                console.warn(
                  '[Gemini proxy] GEMINI_API_KEY not found in .env'
                )

              }
            })

            proxy.on('error', (err) => {

              console.error(
                '[Gemini proxy error]',
                err
              )

            })

          },
        },

      },
    },

    theme: {
      extend: {
        colors: {
          primarytextcolor:
            'rgba(var(--primary-text-color))',
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