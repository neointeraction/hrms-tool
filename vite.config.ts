import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// **!!! CRITICAL CHANGE HERE !!!**
// 1. Replace 'your-repo-name' with the exact name of your GitHub repository.
const repoName = "neointeraction";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Set the base path for deployment to GitHub Pages (e.g., /my-awesome-app/)
  base: `/${repoName}/`,
});
