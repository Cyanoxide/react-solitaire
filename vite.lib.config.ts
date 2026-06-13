import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const mixins = path.resolve(__dirname, 'src/styles/mixins').replace(/\\/g, '/');

// Library build: emits the <Solitaire /> component for consumers (e.g. react-xp)
export default defineConfig({
    plugins: [
        react(),
        dts({ tsconfigPath: './tsconfig.app.json', entryRoot: 'src', include: ['src'], exclude: ['src/main.tsx'] }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use "${mixins}" as *;\n`,
            },
        },
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            formats: ['es'],
            fileName: () => 'solitaire.js',
            cssFileName: 'style',
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime'],
        },
        outDir: 'dist',
        emptyOutDir: true,
    },
});
