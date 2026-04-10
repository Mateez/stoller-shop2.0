import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FAF8F5",
          100: "#F5F0EA",
          200: "#E8DFD3",
          300: "#D4C4AE",
          400: "#C4A882",
          500: "#B08D5E",
          600: "#96744A",
          700: "#7A5D3C",
          800: "#5E4730",
          900: "#3D2E1F",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0,0,0,0.04), 0 4px 6px -4px rgba(0,0,0,0.02)",
        card: "0 4px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.03)",
        elevated: "0 10px 40px -10px rgba(0,0,0,0.08), 0 4px 12px -4px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
