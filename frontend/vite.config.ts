
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En desarrollo, /api y /socket.io se reenvian al backend (puerto 3001).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/socket.io': { target: 'http://localhost:3001', ws: true },
    },
  },
});

