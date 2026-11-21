import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [
    {
      name: 'preserve-vite-query-flags-behind-next',
      configureServer(server) {
        server.middlewares.use((request, _response, next) => {
          // Next rewrites serialize ?raw as ?raw=; Vite expects bare query flags.
          if (request.url) request.url = request.url.replace(/([?&])(raw|url|inline|direct|import)=(?=&|$)/g, '$1$2')
          next()
        })
        server.middlewares.use((request, response, next) => {
          // The Vite server is an internal zone. A direct browser navigation must
          // use Next so its routes and same-origin session BFF are available.
          const host = request.headers.host || ''
          const direct = /^(localhost|127\.0\.0\.1):5173$/i.test(host)
          const navigation = request.method === 'GET' && request.headers['sec-fetch-mode'] === 'navigate'
          if (direct && navigation) {
            response.writeHead(307, { Location: `http://127.0.0.1:3000${request.url || '/'}`, 'Cache-Control': 'no-store' })
            response.end()
            return
          }
          next()
        })
      },
    },
    react(),
    
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    // HMR connects directly to Vite while HTML is served through the Next shell.
    hmr: process.env.VITE_TEST_DISABLE_HMR === '1' ? false : { host: '127.0.0.1', port: 5173 },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      }
    }
  }
})
