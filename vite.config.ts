/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Framework code changes on dependency bumps, route code on every
        // feature change; separate chunks let browsers keep the vendors cached.
        manualChunks: {
          react: ["react", "react-dom"],
          "react-router": ["react-router"],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    setupFiles: "./src/test/setup.ts",
  },
});
