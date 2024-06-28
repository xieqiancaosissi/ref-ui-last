import React from "react";
import { LiquidityEmptyIcon } from "./icon";

export default function NoLiquidity() {
  return (
    <div className="w-80 h-56 rounded-md bg-modalGrayBg p-4 fccc">
      <LiquidityEmptyIcon />
      <div className="text-gray-10 text-sm my-7">
        No Positions in this pool yet
      </div>
      <div className="poolBtnStyle cursor-pointer">Add Liquidity</div>
    </div>
  );
}
