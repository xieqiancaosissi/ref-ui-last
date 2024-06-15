import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SetIcon } from "../../components/swap/icons";
import { QuestionIcon } from "../../components/commonIcons";
import { useSwapStore } from "../../stores/swap";
import swapStyles from "./swap.module.css";

export default function SetPopup() {
  const [show, setShow] = useState<boolean>();
  const [slippage, setSlippage] = useState<string>("0.5");
  const slippageOptions = ["0.1", "0.5", "1"];
  const swapStore: any = useSwapStore();
  const smartRoute = swapStore.getSmartRoute();
  useEffect(() => {
    function handleOutsideClick(event: any) {
      const path = event.composedPath();
      const el = path.find((el: any) => el.id == "setDiv");
      if (!el) {
        hideSet();
      }
    }
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);
  function switchSmartRoute() {
    swapStore.setSmartRoute(!smartRoute);
  }
  function switchSet() {
    setShow(!show);
  }
  function hideSet() {
    setShow(false);
  }
  const variants = {
    on: { marginLeft: "16px" },
    off: { marginLeft: "0px" },
  };
  return (
    <div className="relative" id="setDiv">
      <span className={swapStyles.swapControlButton} onClick={switchSet}>
        <SetIcon />
      </span>
      <div
        className={`right-0 top-9 rounded-lg border border-gray-140 bg-gray-40 p-4 ${
          show ? "absolute" : "hidden"
        }`}
      >
        {/* title */}
        <span className="text-base font-bold text-gray-110 whitespace-nowrap">
          Transaction Settings
        </span>
        {/* Slippage tolerance */}
        <div className="my-6">
          <span className="text-sm text-gray-50">Slippage tolerance</span>
          <div className="flex items-stretch justify-between mt-2 gap-2 text-sm">
            <div
              className="flex items-center gap-1 border border-dark-50 rounded bg-black bg-opacity-20"
              style={{ padding: "3px" }}
            >
              {slippageOptions.map((item) => {
                return (
                  <span
                    className={`flex items-center justify-center  h-5 rounded px-2  cursor-pointer ${
                      slippage == item
                        ? "bg-gray-120 text-white"
                        : "text-gray-50"
                    }`}
                    key={item}
                  >
                    {item}%
                  </span>
                );
              })}
            </div>
            <div
              className="flex items-center gap-1 border border-dark-50 rounded bg-black bg-opacity-20 text-white"
              style={{ padding: "3px 6px" }}
            >
              <input
                className="w-8 bg-transparent outline-none text-right"
                // value={0.5}
              />
              %
            </div>
          </div>
        </div>
        {/* Smart Route switch */}
        <div className="flexBetween">
          <div className="flexBetween gap-1">
            <span className="text-sm text-gray-50">Disable Smart Route</span>
            <QuestionIcon className=" text-gray-10 hover:text-white cursor-pointer" />
          </div>
          <div
            className={`flex items-center relative h-4 rounded-2xl cursor-pointer p-px w-8 ${
              smartRoute ? "bg-gray-130" : "bg-greenGradientDark"
            }`}
            onClick={switchSmartRoute}
          >
            <motion.div
              className="absolute rounded-full border border-gray-40 border-opacity-40"
              variants={variants}
              initial={smartRoute ? "off" : "on"}
              animate={smartRoute ? "off" : "on"}
            >
              <span className="block w-3 h-3 bg-white rounded-full"></span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
