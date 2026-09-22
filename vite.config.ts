import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split the heavyweight vendors so the app shell stays small and
        // each engine chunk caches independently.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return
          if (id.includes('@react-three') || id.includes('postprocessing') || id.includes('/three/')) {
            return 'three'
          }
          if (id.includes('/gsap/')) return 'gsap'
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/') ||
            id.includes('/styled-components/')
          ) {
            return 'react'
          }
        },
      },
    },
  },
})
