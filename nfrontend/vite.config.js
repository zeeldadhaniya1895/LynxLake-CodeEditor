// nfrontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to backend
      '/api': 'http://localhost:5000', // <-- backend port
    },
  },
});