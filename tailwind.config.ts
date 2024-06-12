import type { Config } from "tailwindcss";
const plugin = require("tailwindcss/plugin");
const getStyleMapping = (max: number, min: number) => {
  if (!max) {
    return;
  }
  // @ts-ignore
  const maxArray = [...Array(max + 1).keys()];
  return maxArray.reduce((pre, cur) => {
    cur >= min && (pre[cur] = `${cur / 4}rem`);
    return pre;
  }, {});
};
const config: Config = {
  darkMode: "selector",
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
        poolTabBgOpacity15: "rgba(126, 138, 147, 0.15)",
        gray: {
          10: "#91A2AE",
          20: "#212B35",
          30: "#1C252E",
          40: "#2A3643",
          50: "#6A7279",
          60: "#7E8A93",
          70: "#2D343D",
          80: "#8C9093",
          90: "#26323C",
          100: "#2B3843",
          110: "#AABAC7",
          120: "#4E5B6A",
          130: "#717E8D",
          140: "#414B57",
        },
        dark: {
          10: "#1B242C",
          20: "#DFE4E8",
          30: "#030f16",
          40: "#2B343B",
          50: "#3A434D",
          60: "#141C22",
        },
        green: {
          10: "#9EFE01",
        },
        lightWhite: {
          10: "#FFF2F2",
          20: "#F6FBFE",
        },
        red: {
          10: "#FF4B76",
        },
        yellow: {
          10: "#E6B401",
        },
      },
      width: {
        ...getStyleMapping(1800, 0),
      },
      minWidth: {
        ...getStyleMapping(1800, 0),
      },
      height: {
        ...getStyleMapping(1800, 0),
      },
      minHeight: {
        ...getStyleMapping(1800, 0),
      },
      maxHeight: {
        ...getStyleMapping(1800, 0),
      },
      backgroundImage: (theme) => ({
        poolsTypelinearGrayBg:
          "linear-gradient(356.54deg, #2A3643 2.38%, #6A88A9 90.82%)",
        farmTitleBg:
          "linear-gradient(180deg, rgba(33, 43, 53, 0) 24.77%, rgba(33, 43, 53, 0.4) 124.77%)",
        farmTitleBtnBor:
          "linear-gradient(90deg, rgba(255, 247, 45, 0.3) 0%, rgba(158, 255, 0, 0.3) 100%)",
        greenGradient: "linear-gradient(90deg, #9EFF00 0%, #5F9900 100%)",
        greenGradient2: "linear-gradient(90deg, #9DFD01 0%, #5F9900 110.34%)",
      }),
    },
  },
  plugins: [
    plugin(function ({ addUtilities }: { addUtilities: any }) {
      addUtilities({
        ".frc": {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        },
        ".frcc": {
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        },
        ".frcs": {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        },
        ".frsc": {
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "start",
        },

        ".frcb": {
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },

        ".fccc": {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        },
      });
    }),
  ],
};
export default config;
