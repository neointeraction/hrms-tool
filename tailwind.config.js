/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#3b82f6", // blue-500
          secondary: "#6366f1", // indigo-500
          accent: "#8b5cf6", // violet-500
        },
        status: {
          success: "#22c55e", // green-500
          warning: "#f59e0b", // amber-500
          error: "#ef4444", // red-500
          info: "#3b82f6", // blue-500
        },
        bg: {
          main: "var(--bg-main)",
          sidebar: "var(--bg-sidebar)",
          card: "var(--bg-card)",
          hover: "var(--bg-hover)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          inverse: "var(--text-inverse)",
        },
        border: {
          DEFAULT: "var(--border-color)",
        },
      },
      fontFamily: {
        sans: ["Lato", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
