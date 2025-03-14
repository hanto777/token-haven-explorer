import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  assetsInclude: ["**/*.bin"],
  plugins: [
    react(),
    nodePolyfills(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  define: {
    "import.meta.env.MOCKED": process.env.MOCKED === "true",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "::",
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  worker: {
    format: "es",
    rollupOptions: {
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
}));
