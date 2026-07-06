import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT || 4000}`,
        changeOrigin: true,
      },
      '/uploads': {
        target: `http://localhost:${process.env.PORT || 4000}`,
        changeOrigin: true,
      },
    },
  },
});
