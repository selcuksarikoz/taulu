import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config
export default defineConfig({
  base: "./", // Use relative paths - this is critical for packaged Electron apps
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: "./postcss.config.js",
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: process.env.NODE_ENV === "production",
    // Make sure assets are using relative paths
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks: undefined,
        // Ensure all assets use relative paths
        assetFileNames: "assets/[name].[hash].[ext]",
        chunkFileNames: "assets/[name].[hash].js",
        entryFileNames: "assets/[name].[hash].js",
      },
    },
  },
  server: {
    port: 3000,
  },
  // Make sure to handle ESM/CJS differences properly
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
});
