import React from "react";
import { useLimitStore } from "@/stores/limitOrder";
import {
  Images,
  Symbols,
} from "@/components/pools/detail/liquidity/components/liquidityComComp";
import RateExchange from "./RateExchange";
import useTokenRate24h from "@/hooks/useTokenRate24h";
import { priceFormatter } from "@/services/limit/limitUtils";
import { IoArrowUpOutline } from "../reactIcons";
export default function ChartTopBar() {
  const limitStore = useLimitStore();
  const tokenIn = limitStore.getTokenIn();
  const tokenOut = limitStore.getTokenOut();
  const diff = useTokenRate24h({
    base_token: tokenOut,
    token: tokenIn,
  });
  function switchTokens() {
    limitStore.setTokenIn(tokenOut);
    limitStore.setTokenOut(tokenIn);
  }
  if (!(tokenIn && tokenOut)) return null;
  return (
    <div className="flex items-center gap-3 pl-1.5">
      <div className="frcs">
        <Images
          borderStyle="1px solid #273342"
          size="6"
          tokens={[tokenIn, tokenOut]}
          uId={"swap-chart-header"}
          allowSameToken
          className="xsm:text-sm"
        />

        <Symbols
          className="ml-2 mr-2.5"
          tokens={[tokenIn, tokenOut]}
          size="4"
          separator="/"
        />
      </div>
      <div className="frcs xsm:ml-0">
        {diff && (
          <span className="text-sm text-gray-60">1 {tokenIn.symbol} =</span>
        )}
        <span className="text-white text-2xl font-extrabold px-2.5">
          {diff ? priceFormatter(diff.curPrice) : "-"}
        </span>

        {diff && (
          <span className="mr-1.5  text-sm text-gray-60">
            {tokenOut.symbol}
          </span>
        )}
        {diff && (
          <span
            className={`frcs text-xs rounded px-1 py-0.5
            ${
              diff.direction === "up"
                ? "text-primaryGreen bg-primaryGreen bg-opacity-10"
                : diff.direction === "down"
                ? "text-red-10 bg-red-10 bg-opacity-10"
                : "text-gray-60 bg-gray-60 bg-opacity-10"
            }
            
            `}
          >
            {diff.direction !== "unChange" && (
              <IoArrowUpOutline
                className={`${
                  diff.direction === "down" ? "transform  rotate-180  " : ""
                } `}
              />
            )}

            {diff.percent}
          </span>
        )}
      </div>
      <RateExchange onChange={switchTokens} />
    </div>
  );
}
