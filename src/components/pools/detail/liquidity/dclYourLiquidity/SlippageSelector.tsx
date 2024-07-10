import React, { useContext, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import HoverTip from "@/components/common/Tips";
export function PoolSlippageSelectorV3({
  slippageTolerance,
  onChange,
  textColor,
}: {
  slippageTolerance: number;
  onChange: (slippage: number) => void;
  textColor?: string;
}) {
  const validSlippages = [0.1, 0.5, 1.0];
  const intl = useIntl();
  const slippageCopyId = "slippageCopy";

  return (
    <>
      <fieldset className="flex lg:items-center flex-wrap justify-between mb-4 pt-2">
        <div className="flex items-center md:mb-4 xs:mb-4">
          <label
            className={`text-sm text-center ${textColor || "text-primaryText"}`}
          >
            Slippage tolerance
          </label>
          <div className="text-primaryText">
            <HoverTip msg={slippageCopyId} extraStyles={"w-15"} />
          </div>
        </div>

        <div className="flex text-white items-center">
          {validSlippages.map((slippage) => (
            <div
              key={slippage}
              className={`flex items-center justify-center cursor-pointer w-12 rounded-lg text-xs border  hover:border-gradientFromHover  py-1 px-2 mx-1 ${
                slippage === slippageTolerance
                  ? "text-black bg-gradientFromHover border-gradientFromHover hover:text-black"
                  : "text-farmText border-maxBorderColor hover:text-gradientFromHover"
              }`}
              onClick={() => onChange(slippage)}
            >
              {slippage}%
            </div>
          ))}
        </div>
      </fieldset>
    </>
  );
}
