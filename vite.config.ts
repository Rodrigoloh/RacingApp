import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web'
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-native-web', 'react-native-safe-area-context']
  },
  server: {
    open: true
  }
});

