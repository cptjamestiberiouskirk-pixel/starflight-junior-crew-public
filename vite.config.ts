import { readFileSync, readdirSync, cpSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {shipRuntimePlan} from './scripts/ship-runtime.mjs';

// Keep the exported artwork in place and publish only the game's assets.
function gameAssets(ships:ReturnType<typeof shipRuntimePlan>): Plugin {
  return {
    name: 'original-game-assets',
    apply: 'build',
    closeBundle() {
      mkdirSync(new URL('./dist/assets/ships/configurations/',import.meta.url),{recursive:true});
      for(const name of ['catalog.json','manifest.json'])cpSync(new URL('./assets/ships/'+name,import.meta.url),new URL('./dist/assets/ships/'+name,import.meta.url));
      for(const ship of ships)cpSync(ship.from,new URL('./dist/assets/ships/configurations/'+ship.file,import.meta.url));
    },
    generateBundle() {
      this.emitFile({type:'asset',fileName:'assets/ships/runtime.json',source:JSON.stringify(ships.map(({from,...row})=>row))});
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

export default defineConfig(({command})=>{
  const ships=command==='build'?shipRuntimePlan():[];
  return {
  define:{__SHIP_WEBP_KEYS__:JSON.stringify(ships.filter(s=>s.file.endsWith('.webp')).map(s=>s.file.slice(0,-5)))},
  // Relative URLs support both username.github.io and project subdirectories.
  base: './',
  publicDir: false,
  // Historical HTML captures and migration snapshots are evidence, not app entries.
  optimizeDeps: { entries: ['index.html'] },
  plugins: [react(), tailwindcss(), gameAssets(ships)],
  server: {
    fs: { allow: [fileURLToPath(new URL('.', import.meta.url))] },
    watch: { ignored: ['**/artifacts/**'] },
  },
  build: { target: 'es2022' },
};});

