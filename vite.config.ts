// Fix in vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src' // Add path alias
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'] // Add explicit dependencies
  }
});