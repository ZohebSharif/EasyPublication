import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { resolve } from "path";

export default defineConfig(({ command, mode }) => ({
  plugins: [react(), svgr()],
  base: command === "serve" ? "/" : "/EasyPublication/",
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode)
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      }
    }
  },
  publicDir: "public"
}));
