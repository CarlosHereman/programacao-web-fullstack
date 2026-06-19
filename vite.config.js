import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { compression } from "vite-plugin-compression2";

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: "gzip",
      exclude: [/\.(png|jpg|jpeg|gif|svg|ico|webp)$/],
      threshold: 1024,
    }),
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
    minify: true,
    sourcemap: false,
  },
  server: {
    port: 5173,
  },
});
