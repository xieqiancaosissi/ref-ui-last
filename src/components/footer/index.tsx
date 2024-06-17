import { useEffect } from "react";
import Big from "big.js";
import { motion } from "framer-motion";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { communityLinks, docLinks } from "./footerData";
import { MoonIcon, SunIcon, RefPriceIcon } from "./icons";
import { useThemeStore } from "../../stores/theme";
import { useRefPrice } from "../../hooks/useRefPrice";
export default function Footer() {
  const themeStore: any = useThemeStore();
  const currentTheme = themeStore.getTheme();
  const { refPrice, priceLoading } = useRefPrice();
  useEffect(() => {
    if (currentTheme == "light") {
      document.documentElement.className = "light";
    } else {
      document.documentElement.className = "dark";
    }
  }, []);
  function jump(url: string) {
    window.open(url);
  }
  function toggleTheme() {
    if (currentTheme == "dark") {
      document.documentElement.classList.remove("dark");
      themeStore.setTheme("light");
    } else {
      document.documentElement.classList.add("dark");
      themeStore.setTheme("dark");
    }
  }
  const variants = {
    dark: { left: "2px" },
    light: { left: "24px" },
  };
  return (
    <div className="flex items-center justify-between text-white h-9 border-t border-white border-opacity-10 px-6">
      <div className="flex items-center gap-4">
        {communityLinks.map((item) => {
          return (
            <div
              className="cursor-pointer text-gray-50 hover:text-primaryGreen"
              key={item.label}
              onClick={() => {
                jump(item.url);
              }}
            >
              {item.icon}
            </div>
          );
        })}
      </div>
      <div className="flex items-center">
        <div className="flex items-center gap-1 mr-5">
          <RefPriceIcon />
          {!priceLoading ? (
            <span>
              {refPrice && !isNaN(parseFloat(refPrice))
                ? "$" + Big(refPrice).toFixed(2)
                : "-"}
            </span>
          ) : (
            <SkeletonTheme
              baseColor="rgba(106, 114, 121, 0.3)"
              highlightColor="rgba(255, 255, 255, 0.3)"
            >
              <Skeleton width={42} height={16} />
            </SkeletonTheme>
          )}
        </div>
        <LineSplit />
        {docLinks.map((item, index) => {
          return (
            <>
              {" "}
              <div
                onClick={() => {
                  jump(item.url);
                }}
                key={item.id}
                className={`flex items-end gap-1 text-xs font-bold text-gray-50 hover:text-primaryGreen cursor-pointer px-5 `}
              >
                {item.icon || ""}
                {item.label}
              </div>
              {index !== docLinks.length - 1 ? <LineSplit /> : null}
            </>
          );
        })}

        <div
          className="flex items-center relative rounded-2xl bg-dark-20  dark:bg-opacity-20 bg-opacity-80 h-6 p-0.5 cursor-pointer mr-3"
          style={{ width: "46px" }}
          onClick={toggleTheme}
        >
          <motion.div
            className="absolute"
            variants={variants}
            initial={currentTheme == "dark" ? "dark" : "light"}
            animate={currentTheme == "dark" ? "dark" : "light"}
          >
            {currentTheme == "dark" ? <MoonIcon /> : <SunIcon />}
          </motion.div>
        </div>

        <div className="flex items-center justify-center w-6 h-6 rounded border border-white border-opacity-20 font-semibold text-xs text-gray-50 cursor-pointer">
          EN
        </div>
      </div>
    </div>
  );
}
function LineSplit() {
  return (
    <div className="bg-gray-50" style={{ width: "1px", height: "10px" }}></div>
  );
}
