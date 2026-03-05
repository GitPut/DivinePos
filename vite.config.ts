import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";

export default defineConfig({
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
  },
  server: {
    port: 3000,
    open: true,
  },
});
