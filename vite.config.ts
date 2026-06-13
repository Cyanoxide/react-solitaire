import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const mixins = path.resolve(__dirname, 'src/styles/mixins').replace(/\\/g, '/');

// Standalone full-screen app (dev + production build).
// Builds to dist-app/ so it never collides with the library build in dist/.
export default defineConfig({
    // Bind all interfaces so the dev URL works in Firefox (which resolves
    // localhost to IPv4) without needing a --host flag
    server: { host: true },
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
