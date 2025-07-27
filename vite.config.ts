import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // Extension entry points
        background: resolve(__dirname, "src/background.js"),
        content: resolve(__dirname, "src/content.ts"),

        // Extension pages
        popup: resolve(__dirname, "src/popup-main.tsx"),
        options: resolve(__dirname, "src/options-main.tsx"),
        onboarding: resolve(__dirname, "src/onboarding-main.tsx"),
        "mindful-pause": resolve(__dirname, "src/mindful-pause-main.tsx"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.names[0].endsWith(".css")) {
            return "assets/styles.css"; // Always use this name for CSS
          }
          return "assets/[name].[ext]";
        },
      },
    },
    cssCodeSplit: false,
  },
});
