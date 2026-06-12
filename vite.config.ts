import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * GitHub Pages needs base path because app is hosted under:
 * /restaurant-closeout-sheet/
 */
export default defineConfig({
  plugins: [react()],
  base: "/restaurant-closeout-sheet/",
});