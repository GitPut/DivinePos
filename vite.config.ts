import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0"),
  },
  plugins: [
    react(),
    nodePolyfills({
      include: ["process", "crypto", "stream", "assert", "url", "querystring", "http", "https", "zlib", "path", "buffer", "util", "vm"],
      globals: { process: true, Buffer: true },
    }),
  ],
  resolve: {
    alias: {
      assets: path.resolve(__dirname, "assets"),
      features: path.resolve(__dirname, "features"),
      shared: path.resolve(__dirname, "shared"),
      services: path.resolve(__dirname, "services"),
      store: path.resolve(__dirname, "store"),
      utils: path.resolve(__dirname, "utils"),
      router: path.resolve(__dirname, "router"),
      types: path.resolve(__dirname, "types"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ["firebase/compat/app", "firebase/compat/firestore", "firebase/compat/auth", "firebase/compat/storage", "firebase/compat/functions"],
          stripe: ["@stripe/stripe-js", "@stripe/react-stripe-js"],
          charts: ["recharts"],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
