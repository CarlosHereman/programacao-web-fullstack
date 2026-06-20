import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { compression } from "vite-plugin-compression2";

/**
 * Configuração do Vite com otimizações de frontend:
 * - Compressão gzip e brotli dos arquivos estáticos gerados no build
 * - Code splitting automático para chunks menores
 */
export default defineConfig({
  plugins: [
    react(),
    // Compressão gzip dos arquivos estáticos (JS, CSS, HTML)
    compression({
      algorithm: "gzip",
      exclude: [/\.(png|jpg|jpeg|gif|svg|ico|webp)$/],
      threshold: 1024,
    }),
    // Compressão brotli (melhor taxa de compressão que gzip)
    compression({
      algorithm: "brotliCompress",
      exclude: [/\.(png|jpg|jpeg|gif|svg|ico|webp)$/],
      threshold: 1024,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "vendor";
          }
          if (id.includes("node_modules/react-hook-form")) {
            return "forms";
          }
          if (id.includes("node_modules/axios")) {
            return "http";
          }
        },
      },
    },
    // Vite 8 usa oxc por padrão (não requer esbuild separado)
    minify: true,
    sourcemap: false,
  },
  server: {
    port: 5173,
  },
});
