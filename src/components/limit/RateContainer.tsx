import { useMemo } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { SubIcon, AddIcon } from "./icons";

export default function RateContainer(props: any) {
  return (
    <div className="bg-dark-60 rounded w-3/4 border border-transparent hover:border-green-10 p-3.5 text-sm text-gray-50">
      <div className="flexBetween">
        <div className="flex items-center gap-0.5">
          <span>Buy in rate</span>
          <span className=" text-primaryGreen">(+12.35%)</span>
        </div>
        <span className="underline hover:text-primaryGreen cursor-pointer">
          Market Price
        </span>
      </div>
      <div className="flexBetween mt-2.5 gap-2">
        <SubIcon className="cursor-pointer" />
        <div className="flexBetween">
          <input
            value="6.8786787"
            className="text-white text-base font-bold text-center"
          />
          <span>USDC.e</span>
        </div>
        <AddIcon className="cursor-pointer" />
      </div>
    </div>
  );
}
