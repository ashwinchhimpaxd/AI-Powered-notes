import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path" // Ye line zaroori hai
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/nvidia/v1': {
        target: 'https://integrate.api.nvidia.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/nvidia\/v1/, '/v1'),
        configure: (proxy) => {
          proxy.on('error', (err) => console.error('[proxy error]', err));
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
})
