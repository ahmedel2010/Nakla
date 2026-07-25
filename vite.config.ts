import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== "true",
      watch:
        process.env.DISABLE_HMR === "true"
          ? null
          : { ignored: ["**/node_modules/**", "**/dist/**"] },
    },
    build: {
      minify: "esbuild",
      target: "es2020",
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/")
            ) {
              return "react-vendor";
            }
            if (
              id.includes("node_modules/motion") ||
              id.includes("node_modules/framer-motion")
            ) {
              return "motion-vendor";
            }
            if (id.includes("node_modules/lucide-react")) {
              return "icons-vendor";
            }
            if (
              id.includes("node_modules/html2canvas") ||
              id.includes("node_modules/jspdf")
            ) {
              return "pdf-vendor";
            }
          },
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },
    },
  };
});
