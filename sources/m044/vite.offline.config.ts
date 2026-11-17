import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  publicDir: false,
  build: {
    outDir: "offline-dist",
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: "offline/index.html",
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
