import path from 'path'
import { defineConfig } from 'vite'
import vuePlugin from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vuePlugin()],
  build: {
    minify: false,
    // Use Vite lib mode https://vitejs.dev/guide/build.html#library-mode
    lib: {
      entry: path.resolve(__dirname, './src/main.ts'),
      formats: ['cjs'],
    },
    rollupOptions: {
      output: {
        // Overwrite default Vite output fileName
        entryFileNames: 'main.js',
        assetFileNames: 'styles.css',
      },
      external: [
        'obsidian',
        'electron',
        '@codemirror/autocomplete',
        '@codemirror/closebrackets',
        '@codemirror/collab',
        '@codemirror/commands',
        '@codemirror/comment',
        '@codemirror/fold',
        '@codemirror/gutter',
        '@codemirror/highlight',
        '@codemirror/history',
        '@codemirror/language',
        '@codemirror/lint',
        '@codemirror/matchbrackets',
        '@codemirror/panel',
        '@codemirror/rangeset',
        '@codemirror/rectangular-selection',
        '@codemirror/search',
        '@codemirror/state',
        '@codemirror/stream-parser',
        '@codemirror/text',
        '@codemirror/tooltip',
        '@codemirror/view',
      ],
    },
    // Use root as the output dir
    emptyOutDir: false,
    outDir: '.',
  },
})
