import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    target: "es2022",
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
  },
  worker: {
    format: "es",
  },
  optimizeDeps: {
    exclude: ["pdfjs-dist"],
  },
});
