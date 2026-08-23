/* eslint-env node */
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      host: 'localhost',   // avoid Windows firewall prompts from binding 0.0.0.0
      port: 3000,
      // strictPort removed — if 3000 is taken, Vite auto-increments instead of hanging
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    plugins: [
      react(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // Split vendor chunks so browsers can cache libraries separately from app code
      rollupOptions: {
        output: {
          manualChunks: {
            'react-core': ['react', 'react-dom'],
            'react-router': ['react-router-dom'],
            'react-query': ['@tanstack/react-query'],
            'radix-ui': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-tooltip',
              '@radix-ui/react-tabs',
              '@radix-ui/react-select',
              '@radix-ui/react-accordion',
              '@radix-ui/react-popover',
              '@radix-ui/react-toast',
            ],
            'charts': ['recharts'],
            'ui-utils': ['clsx', 'tailwind-merge', 'class-variance-authority', 'lucide-react'],
          },
        },
      },
      // Strip console.log in production for a leaner bundle
      minify: 'esbuild',
      target: 'esnext',
      // Warn when individual chunks exceed 600KB
      chunkSizeWarningLimit: 600,
    },
    test: {
      globals: true,
      environment: "node",
      setupFiles: "./src/test/setup.js",
    },
  };
});
