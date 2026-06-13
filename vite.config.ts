import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const mixins = path.resolve(__dirname, 'src/styles/mixins').replace(/\\/g, '/');

// Standalone full-screen app (dev + production build).
// Builds to dist-app/ so it never collides with the library build in dist/.
export default defineConfig({
    plugins: [react()],
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use "${mixins}" as *;\n`,
            },
        },
    },
    build: {
        outDir: 'dist-app',
    },
});
