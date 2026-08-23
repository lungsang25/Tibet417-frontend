import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    imagetools(),
    // Only runs on `npm run analyze` — opt-in, not part of the default build.
    process.env.ANALYZE && visualizer({ open: true, filename: 'dist/stats.html', gzipSize: true }),
  ].filter(Boolean),
  server: {port:5173}
})
