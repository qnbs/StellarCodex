import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      /** Cloud API keys are never injected at build time — use Settings → encrypted vault (BYOK). */
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              react: ['react', 'react-dom'],
              state: ['@reduxjs/toolkit', 'react-redux', 'redux', 'redux-persist'],
            },
          },
        },
      },
    };
});
