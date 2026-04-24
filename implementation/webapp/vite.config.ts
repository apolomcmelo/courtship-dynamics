import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    base: '/courtship-dynamics/',
    server: {
        fs: {
            // Allow importing files from the repo root (needed for research.md ?raw import)
            allow: [path.resolve(__dirname, '../..')],
        },
    },
});
