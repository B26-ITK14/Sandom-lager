import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = process.env.API_TARGET ?? 'http://localhost:5000';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
    // Bind to 0.0.0.0 to accept connections from all interfaces
    // This allows WebSocket HMR to work from other machines and Docker
    host: '0.0.0.0',
    // HMR configuration for proper WebSocket connection
    hmr: {
      host: process.env.VITE_HMR_HOST || 'localhost',
      port: process.env.VITE_HMR_PORT ? parseInt(process.env.VITE_HMR_PORT) : 5173,
    },
    // Enable compression for dev server
    middlewareMode: false,
  },
  build: {
    // Optimize CSS and JS splitting
    rollupOptions: {
      output: {
        // Create separate chunk for vendor code
        manualChunks: (id) => {
          // Split node_modules into separate chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('@auth0')) {
              return 'auth';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('react')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
          // Let Rollup handle internal code splitting to prevent circular chunks
          // (Removed explicit pages and components chunking which caused circular dependencies)
        },
        // Better asset file names for long-term caching
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? 'asset';
          const info = name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|gif|svg/.test(ext)) {
            return `assets/images/[name].[hash][extname]`;
          } else if ('css' === ext) {
            return `assets/css/[name].[hash].css`;
          } else {
            return `assets/[name].[hash][extname]`;
          }
        },
      },
      input: {
        main: '/index.html',
      },
    },
    // Optimize build performance
    target: 'es2020',
    // Generate source maps for production debugging (optional)
    sourcemap: false,
    // Chunk size warning threshold (in KB)
    chunkSizeWarningLimit: 600,
    // Report compressed file sizes
    reportCompressedSize: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@auth0/auth0-react',
      'react-router-dom',
      'lucide-react',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
  // Optimize for production
  define: {
    'process.env.NODE_ENV': '"production"',
  },
})
