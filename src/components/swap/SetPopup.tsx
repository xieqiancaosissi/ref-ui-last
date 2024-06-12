import { useState } from "react";
import { SetIcon } from "../../components/swap/icons";
import { QuestionIcon } from "../../components/commonIcons";

export default function SetPopup() {
  const [show, setShow] = useState<boolean>();
  const [slippage, setSlippage] = useState<string>("0.5");
  const slippageOptions = ["0.1", "0.5", "1"];
  return (
    <div className="relative">
      <span className="swapControlButton">
        <SetIcon />
      </span>
      <div className="absolute rounded-lg border border-gray-140 bg-gray-40 p-4">
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
                value={0.5}
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
            className={`flex items-center relative h-4 bg-gray-130 rounded-2xl cursor-pointer p-px w-8 bg-red-800 ${
              // true ? "bg-greenGradient2 " : "bg-gray-130"
              true ? " bg-red-800" : "bg-gray-130"
            }`}
          >
            <span className="absolute w-3 h-3 ml-4 rounded-full bg-white border-2 border-gray-40 border-opacity-40 box-content"></span>
          </div>
          <div className="bg-greenGradient"></div>
        </div>
      </div>
    </div>
  );
}
