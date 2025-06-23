// nfrontend/vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Get service URLs from environment variables with fallbacks
  const API_SERVICE_URL = env.VITE_API_SERVICE_URL || 'http://localhost:5000';
  const SOCKET_SERVICE_URL = env.VITE_SOCKET_SERVICE_URL || 'http://localhost:5001';
  const EXECUTION_SERVICE_URL = env.VITE_EXECUTION_SERVICE_URL || 'http://localhost:5002';

  console.log('🔧 Vite Config - Service URLs:');
  console.log('  API Service:', API_SERVICE_URL);
  console.log('  Socket Service:', SOCKET_SERVICE_URL);
  console.log('  Execution Service:', EXECUTION_SERVICE_URL);

  return {
  plugins: [react()],
  server: {
      port: 5173,
    proxy: {
        // Proxy API requests to API Service
        '/api': {
          target: API_SERVICE_URL,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('API proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('API proxy request:', req.method, req.url);
            });
          }
        },
        // Proxy WebSocket connections for Socket Service
      '/socket.io': {
          target: SOCKET_SERVICE_URL,
          ws: true,
          changeOrigin: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Socket proxy error:', err);
            });
          }
        },
        // Proxy execution requests to Execution Service
        '/execute': {
          target: EXECUTION_SERVICE_URL,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Execution proxy error:', err);
            });
          }
        },
        '/compile': {
          target: EXECUTION_SERVICE_URL,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Compilation proxy error:', err);
            });
          }
        }
    },
  },
    define: {
      // Make environment variables available to the client
      __API_SERVICE_URL__: JSON.stringify(API_SERVICE_URL),
      __SOCKET_SERVICE_URL__: JSON.stringify(SOCKET_SERVICE_URL),
      __EXECUTION_SERVICE_URL__: JSON.stringify(EXECUTION_SERVICE_URL),
    }
  };
});