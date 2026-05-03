import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'gzip', ext: '.gz' }),
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
  base: '/portfolio/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-framer': ['framer-motion'],
          'vendor-icons': ['react-icons', 'lucide-react'],
          'vendor-utils': ['react-scroll', 'react-type-animation', '@emailjs/browser', 'sweetalert2'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
