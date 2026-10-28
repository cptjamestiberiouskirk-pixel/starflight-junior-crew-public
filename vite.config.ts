import { readFileSync, readdirSync, cpSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Keep the exported artwork in place and publish only the game's assets.
function gameAssets(): Plugin {
  return {
    name: 'original-game-assets',
    apply: 'build',
    closeBundle() {
      // Copy finished PNGs without importing or retaining thousands in Rollup memory.
      mkdirSync(new URL('./dist/assets/ships/',import.meta.url),{recursive:true});
      cpSync(new URL('./assets/ships/',import.meta.url),new URL('./dist/assets/ships/',import.meta.url),{recursive:true});
    },
    generateBundle() {
      for(const name of readdirSync(new URL('./assets/crew/',import.meta.url))){
        if(name.endsWith('.webp') || name==='manifest.json')this.emitFile({type:'asset',fileName:`assets/crew/${name}`,source:readFileSync(new URL('./assets/crew/'+name,import.meta.url))});
      }
      const directory = new URL('./assets/images/', import.meta.url);
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        if (!entry.isFile()) continue;
        this.emitFile({
          type: 'asset',
          fileName: `assets/images/${entry.name}`,
          source: readFileSync(new URL(entry.name, directory)),
        });
      }
      this.emitFile({
        type: 'asset',
        fileName: 'THIRD_PARTY_NOTICES.md',
        source: readFileSync(new URL('./THIRD_PARTY_NOTICES.md', import.meta.url)),
      });
      for (const name of [
        'react', 'react-dom', 'lucide-react', 'tailwindcss', 'three',
        '@fontsource/rajdhani', '@fontsource/orbitron', '@fontsource/chakra-petch',
      ]) {
        this.emitFile({
          type: 'asset',
          fileName: `licenses/${name.replaceAll('/', '-')}.txt`,
          source: readFileSync(new URL(`./node_modules/${name}/LICENSE`, import.meta.url)),
        });
      }
      this.emitFile({ type: 'asset', fileName: '.nojekyll', source: '' });
    },
  };
}

export default defineConfig({
  // Relative URLs support both username.github.io and project subdirectories.
  base: './',
  publicDir: false,
  // Historical HTML captures and migration snapshots are evidence, not app entries.
  optimizeDeps: { entries: ['index.html'] },
  plugins: [react(), tailwindcss(), gameAssets()],
  server: {
    fs: { allow: [fileURLToPath(new URL('.', import.meta.url))] },
    watch: { ignored: ['**/artifacts/**'] },
  },
  build: { target: 'es2022' },
});

