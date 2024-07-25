import React from "react";
import { useLimitStore } from "@/stores/limitOrder";
import {
  Images,
  Symbols,
} from "@/components/pools/detail/liquidity/components/liquidityComComp";
import RateExchange from "./RateExchange";
import ChartTab from "./ChartTab";
export default function ChartTopBar() {
  const limitStore = useLimitStore();
  const tokenIn = limitStore.getTokenIn();
  const tokenOut = limitStore.getTokenOut();
  function switchTokens() {
    limitStore.setTokenIn(tokenOut);
    limitStore.setTokenOut(tokenIn);
  }
  if (!(tokenIn && tokenOut)) return null;
  return (
    <div className="frcb pl-1.5">
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
        <div className="xsm:hidden">
          <RateExchange onChange={switchTokens} />
        </div>
      </div>
      <ChartTab />
    </div>
  );
}
