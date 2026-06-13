import { defineConfig } from 'vite';
import { glob } from 'glob';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import injectHTML from 'vite-plugin-html-inject';
import FullReload from 'vite-plugin-full-reload';
import SortCss from 'postcss-sort-media-queries';

// Emit <a href> images (ignored by Vite) as hashed assets and rewrite HTML hrefs after build
function processHrefImages(srcRoot) {
  const hrefImageMap = new Map(); // original href → emitFile name (relative to srcRoot)

  return {
    name: 'process-href-images',
    buildStart() {
      for (const htmlFile of glob.sync(`${srcRoot}/*.html`)) {
        const content = readFileSync(htmlFile, 'utf-8');
        for (const [, href] of content.matchAll(
          /\bhref="([^"#?]+\.(webp|jpe?g|jpg|png|gif))"/gi
        )) {
          if (hrefImageMap.has(href)) continue;
          const absPath = path.resolve(srcRoot, href);
          const name = path.relative(srcRoot, absPath).replace(/\\/g, '/');
          hrefImageMap.set(href, name);
          this.emitFile({ type: 'asset', name, source: readFileSync(absPath) });
        }
      }
    },
    writeBundle(options, bundle) {
      const assetMap = new Map(
        Object.entries(bundle)
          .filter(([, c]) => c.type === 'asset' && c.name)
          .map(([fileName, c]) => [c.name, fileName])
      );
      for (const file of glob.sync(`${options.dir}/**/*.html`)) {
        const original = readFileSync(file, 'utf-8');
        const updated = original.replace(
          /(\bhref=")([^"#?]+\.(webp|jpe?g|jpg|png|gif))(")/gi,
          (match, before, href, _ext, after) => {
            const hashed = assetMap.get(hrefImageMap.get(href));
            return hashed ? `${before}./${hashed}${after}` : match;
          }
        );
        if (updated !== original) writeFileSync(file, updated);
      }
    },
  };
}

export default defineConfig(({ command }) => {
  return {
    define: {
      global: {},
    },
    root: 'src',
    publicDir: '../public',
    build: {
      sourcemap: true,
      rollupOptions: {
        input: glob.sync('./src/*.html'),
        output: {
          manualChunks: id =>
            id.includes('node_modules') ? 'vendor' : undefined,
          entryFileNames: '[name]-[hash].js',
          chunkFileNames: 'js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (name?.endsWith('.css')) return 'css/[name]-[hash][extname]';
            if (name?.match(/\.(png|jpe?g|webp|gif)$/i)) {
              // Plugin-emitted assets include full path in name → preserves folder structure
              return name.includes('/')
                ? '[name]-[hash][extname]'
                : 'images/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
      outDir: '../dist',
      emptyOutDir: true,
    },
    plugins: [
      processHrefImages(path.resolve('src')),
      injectHTML(),
      FullReload(['./src/**/**.html']),
      SortCss({ sort: 'mobile-first' }),
    ],
  };
});
