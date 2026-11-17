import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: "./",
  root: resolve(__dirname, "offline"),
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, "offline-dist"),
    emptyOutDir: true,
    target: "es2022",
    sourcemap: false,
  },
});
