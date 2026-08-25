import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: "./",
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
  },
  build: {
    rolldownOptions: {
      input: {
        abriss: resolve(projectRoot, "index.html"),
        burrow: resolve(projectRoot, "burrow.html"),
      },
    },
  },
});
