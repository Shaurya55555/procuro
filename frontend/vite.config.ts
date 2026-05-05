import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
        proxy: {
          // Forward all /api/* requests to the backend during development.
          // This resolves the CORS issue and ensures the /api base URL works.
          '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GROQ_API_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
