import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh in development
      fastRefresh: true,
      // Optimize JSX runtime
      jsxRuntime: 'automatic'
    }),
    {
      name: 'security-headers',
      configureServer(server) {
        // Rate limiting store for development
        const rateLimitStore = new Map()
        
        server.middlewares.use((req, res, next) => {
          // Rate limiting for contact form submissions
          if (req.url === '/api/contact' || req.method === 'POST') {
            const clientIP = req.connection.remoteAddress || req.socket.remoteAddress
            const now = Date.now()
            const windowMs = 15 * 60 * 1000 // 15 minutes
            const maxRequests = 5 // Max 5 requests per window
            
            if (!rateLimitStore.has(clientIP)) {
              rateLimitStore.set(clientIP, { count: 1, resetTime: now + windowMs })
            } else {
              const clientData = rateLimitStore.get(clientIP)
              if (now > clientData.resetTime) {
                rateLimitStore.set(clientIP, { count: 1, resetTime: now + windowMs })
              } else {
                clientData.count++
                if (clientData.count > maxRequests) {
                  res.statusCode = 429
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'Too many requests. Please try again later.' }))
                  return
                }
              }
            }
          }
          
          // Security headers for development
          res.setHeader('X-Content-Type-Options', 'nosniff')
          res.setHeader('X-Frame-Options', 'DENY')
          res.setHeader('X-XSS-Protection', '1; mode=block')
          res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
          next()
        })
      }
    }
  ],
  build: {
    assetsDir: 'assets',
    sourcemap: false, // Disable source maps in production for security
    minify: 'terser', // Use terser for better minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.info', 'console.debug'] // Remove specific console methods
      },
      mangle: {
        safari10: true // Fix Safari 10 issues
      }
    },
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash].[ext]', // Add hash for cache busting
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animations: ['framer-motion', 'gsap'],
          icons: ['lucide-react'],
          email: ['@emailjs/browser'],
          utils: ['./src/utils/validation'],
          // Split large components
          components: [
            './src/components/CareerTimeline',
            './src/components/Certificates',
            './src/components/TechStack'
          ],
          ui: [
            './src/components/Dock',
            './src/components/SpotlightCard',
            './src/components/MagnetLines',
            './src/components/TextType',
            './src/components/DecryptedText',
            './src/components/ScrambledText',
            './src/components/Loader'
          ]
        }
      },
      external: [], // Keep all dependencies bundled for static hosting
      treeshake: {
        moduleSideEffects: false, // Enable aggressive tree shaking
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      }
    },
    chunkSizeWarningLimit: 1500, // Adjusted for image-heavy portfolio application
    target: 'es2020', // Updated target for better optimization
    cssCodeSplit: true, // Split CSS for better caching
    cssMinify: true, // Minify CSS
    reportCompressedSize: true, // Report compressed size for monitoring
    emptyOutDir: true // Clean output directory before build
  },
  // Production security configuration
  define: {
    __PRODUCTION_SECURITY__: JSON.stringify({
      csp: "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.emailjs.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.emailjs.com; font-src 'self' data:;",
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      },
      rateLimiting: {
        windowMs: 900000, // 15 minutes
        maxRequests: 5, // Max 5 contact form submissions per window
        message: 'Too many contact form submissions. Please try again later.',
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
        standardHeaders: true,
        legacyHeaders: false
      }
    })
  },
  // Server configuration for development
  server: {
    port: 3000,
    host: true, // Allow external connections
    cors: true,
    hmr: {
      overlay: true // Show HMR overlay for errors
    }
  },
  // Preview configuration for production testing
  preview: {
    port: 4173,
    host: true,
    cors: true
  },
  // Optimization settings
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'lucide-react',
      '@emailjs/browser',
      'gsap'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  // Environment variables configuration
  envPrefix: 'VITE_',
  // Asset handling
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp']
})
