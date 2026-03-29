import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify("test"),
  },
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
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
