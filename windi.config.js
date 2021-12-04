import { defineConfig } from 'vite-plugin-windicss'

export default defineConfig({
  extract: {
    include: ['src/**/*.js', 'index.html'],
    exclude: ['node_modules', '.git']
  }
})
