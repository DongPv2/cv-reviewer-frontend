import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Classification badge colors
        excellent: {
          DEFAULT: "#16a34a",   // green-600
          light: "#dcfce7",     // green-100
        },
        good: {
          DEFAULT: "#2563eb",   // blue-600
          light: "#dbeafe",     // blue-100
        },
        improve: {
          DEFAULT: "#d97706",   // amber-600
          light: "#fef3c7",     // amber-100
        },
        critical: {
          DEFAULT: "#dc2626",   // red-600
          light: "#fee2e2",     // red-100
        },
      },
    },
  },
  plugins: [],
};

export default config;
