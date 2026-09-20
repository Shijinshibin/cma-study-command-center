import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages serves this project under /cma-study-command-center/.
  // Vercel serves it from the domain root, so it uses / there.
  base: process.env.GITHUB_ACTIONS === "true"
    ? "/cma-study-command-center/"
    : "/",
});
