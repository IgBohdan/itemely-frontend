import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Чорно-білі кольори
        "bw-black": "#000000",
        "bw-white": "#ffffff",
        "bw-gray-50": "#f9fafb",
        "bw-gray-100": "#f3f4f6",
        "bw-gray-200": "#e5e7eb",
        "bw-gray-300": "#d1d5db",
        "bw-gray-400": "#9ca3af",
        "bw-gray-500": "#6b7280",
        "bw-gray-600": "#4b5563",
        "bw-gray-700": "#374151",
        "bw-gray-800": "#1f2937",
        "bw-gray-900": "#111827",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
  darkMode: "class", // дозволяє використовувати темну тему через клас 'dark'
};
export default config;
