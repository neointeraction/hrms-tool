import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isStaticBuild = mode === "static";

  return {
    plugins: [react()],

    // Use relative paths for static builds to work in any directory
    base: isStaticBuild ? "./" : "/",

    build: {
      // Separate output directory for static builds
      outDir: isStaticBuild ? "dist-static" : "dist",

      // Generate sourcemaps for debugging (disable for production)
      sourcemap: false,

      // Optimize chunk sizes
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          },
        },
      },

      // Compression and optimization
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: isStaticBuild, // Remove console.logs in static build
        },
      },
    },
  };
});
