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
        primaryDark: "#030F1",
        primaryGreen: "#9EFF00",
        gray: {
          10: "#91A2AE",
          20: "#212B35",
          30: "#1C252E",
          40: "#2A3643",
          50: "#6A7279",
          60: "#7E8A93",
          70: "#2D343D",
          80: "#8C9093",
        },
        dark: {
          10: "#1B242C",
        },
        green: {
          10: "#9EFE01",
        },
        lightWhite: {
          10: "#FFF2F2",
        },
      },
    },
  },
  plugins: [],
};
export default config;
