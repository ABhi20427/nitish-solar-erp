import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#7C3AED",
          purplelight: "#A855F7",
          blue: "#2563EB",
          bluelight: "#3B82F6",
          magenta: "#D946EF",
          magentalight: "#EC4899",
          dark: "#0B132B",
          darknavy: "#0F172A",
          slate: "#1E293B",
        },
        navy: {
          50: "#f0f4f9",
          100: "#d9e2f0",
          200: "#b5c7e3",
          300: "#8ba7d4",
          400: "#6085c4",
          500: "#3d65b3",
          600: "#2d4e94",
          700: "#1e3774",
          800: "#0f2352",
          900: "#0b192c",
          950: "#0b132b",
        },
        amber: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-manrope)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7C3AED 0%, #2563EB 50%, #D946EF 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #6D28D9 0%, #1D4ED8 50%, #C026D3 100%)',
        'brand-subtle': 'linear-gradient(180deg, rgba(124, 58, 237, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%)',
      },
      boxShadow: {
        'brand': '0 4px 20px -2px rgba(124, 58, 237, 0.25)',
        'brand-hover': '0 10px 30px -4px rgba(37, 99, 235, 0.35)',
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 10px 25px -5px rgba(11, 19, 43, 0.12), 0 8px 10px -6px rgba(11, 19, 43, 0.08)',
      }
    },
  },
  plugins: [],
};

export default config;
