import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        "surface-1": "var(--color-surface-1)",
        "surface-2": "var(--color-surface-2)",
        text: "var(--color-text)",
        "text-light": "var(--color-text-light)",
      },
    },

    container: {
      center: true,
    },
  },
  plugins: [],
};
export default config;
