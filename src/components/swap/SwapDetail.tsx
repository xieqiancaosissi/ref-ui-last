import { useEffect, useMemo, useState } from "react";
import * as math from "mathjs";
import BigNumber from "bignumber.js";
import Big from "big.js";
import {
  PRICE_IMPACT_RED_VALUE,
  PRICE_IMPACT_WARN_VALUE,
} from "@/utils/constant";
import {
  toInternationalCurrencySystemLongString,
  numberWithCommas,
  toPrecision,
  calculateFeePercent,
  calculateFeeCharge,
  percentLess,
} from "@/utils/numbers";
import { WarnIcon, ArrowDownIcon } from "./icons";
import { useSwapStore, usePersistSwapStore } from "@/stores/swap";
import GetPriceImpact from "./GetPriceImpact";
import SwapRouter from "./SwapRouter";

export default function SwapDetail() {
  const [show, setShow] = useState<boolean>(false);
  const [isRevert, setIsRevert] = useState<boolean>(false);
  const swapStore = useSwapStore();
  const persistSwapStore = usePersistSwapStore();
  const tokenInAmount = swapStore.getTokenInAmount();
  const tokenOutAmount = swapStore.getTokenOutAmount();
  const slippageTolerance = persistSwapStore.getSlippage();
  const tokenIn = swapStore.getTokenIn();
  const tokenOut = swapStore.getTokenOut();
  const allTokenPrices = swapStore.getAllTokenPrices();
  const priceImpact = swapStore.getPriceImpact();
  const avgFee = swapStore.getAvgFee();
  const [fromSymbol, toSymbol, fromPrice, rate] = useMemo(() => {
    if (Big(tokenInAmount || 0).gt(0) && Big(tokenOutAmount || 0).gt(0)) {
      let fromSymbol, toSymbol, fromPrice, rate;
      if (isRevert) {
        fromSymbol = tokenIn.symbol;
        toSymbol = tokenOut.symbol;
        fromPrice = toInternationalCurrencySystemLongString(
          allTokenPrices[tokenIn.id]?.price || "0",
          2
        );
        rate = getRate(tokenOutAmount, tokenInAmount);
      } else {
        fromSymbol = tokenOut.symbol;
        toSymbol = tokenIn.symbol;
        fromPrice = toInternationalCurrencySystemLongString(
          allTokenPrices[tokenOut.id]?.price || "0",
          2
        );
        rate = getRate(tokenInAmount, tokenOutAmount);
      }
      return [fromSymbol, toSymbol, fromPrice, rate];
    }
    return [];
  }, [
    tokenIn?.id,
    tokenOut?.id,
    tokenInAmount,
    tokenOutAmount,
    isRevert,
    JSON.stringify(allTokenPrices),
  ]);
  const priceImpactDisplay = useMemo(() => {
    try {
      return GetPriceImpact(priceImpact, tokenInAmount);
    } catch (error) {
      return null;
    }
  }, [priceImpact, tokenInAmount]);
  const poolFeeDisplay = useMemo(() => {
    try {
      return `${toPrecision(
        calculateFeePercent(avgFee).toString(),
        2
      )}% / ${calculateFeeCharge(avgFee, tokenInAmount)} ${tokenIn.symbol}`;
    } catch (error) {
      return null;
    }
  }, [avgFee, tokenInAmount, tokenIn?.symbol]);
  const minAmountOutDisplay = useMemo(() => {
    let minAmountOut;
    try {
      minAmountOut = tokenOutAmount
        ? toPrecision(
            toPrecision(
              percentLess(
                slippageTolerance,
                toPrecision(
                  tokenOutAmount,
                  Math.min(tokenOut?.decimals ?? 8, 8)
                )
              ),
              tokenOut?.decimals ?? 24
            ),
            6,
            true
          )
        : 0;
    } catch (error) {
      minAmountOut = 0;
    }
    return `${minAmountOut} ${tokenOut?.symbol}`;
  }, [tokenOutAmount, slippageTolerance, tokenOut?.decimals, tokenOut?.symbol]);
  function getRate(fromAmount: string, toAmount: string) {
    const result = math.evaluate(`${fromAmount} / ${toAmount}`);
    if (new BigNumber(result).isLessThan("0.0001")) {
      return "<0.0001";
    } else {
      const floor: any = math.floor;
      return numberWithCommas(floor(result, 4).toString());
    }
  }
  function showDetail() {
    setShow(!show);
  }
  function switchSwapRate(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.preventDefault();
    setIsRevert(!isRevert);
  }
  if (!(tokenIn?.id && tokenOut?.id && tokenInAmount && tokenOutAmount))
    return null;
  return (
    <div className="mt-3 text-sm text-gray-50">
      {/* title */}
      <div className="flexBetween px-4">
        <span
          className="cursor-pointer hover:text-white"
          onClick={switchSwapRate}
        >
          1 {fromSymbol}(${fromPrice})≈{rate} {toSymbol}
        </span>
        <div
          className="flex items-center gap-1.5 cursor-pointer"
          onClick={showDetail}
        >
          <WarnIcon
            className={`${
              Number(priceImpact || 0) > PRICE_IMPACT_RED_VALUE
                ? "text-red-10"
                : Number(priceImpact || 0) > PRICE_IMPACT_WARN_VALUE &&
                  Number(priceImpact || 0) <= PRICE_IMPACT_RED_VALUE
                ? "text-yellow-10"
                : "hidden"
            }`}
          />
          <span>Details</span>
          <ArrowDownIcon
            className={`${
              show ? "text-white transform rotate-180" : "text-gray-50"
            }`}
          />
        </div>
      </div>
      {/* content */}
      <div
        className={`flex flex-col gap-2.5 mt-3 rounded border border-gray-90 px-3.5 py-3 ${
          show ? "" : "hidden"
        }`}
      >
        <div className="flexBetween">
          <span>Price impact</span>
          <div className="flex items-center gap-1">
            {priceImpactDisplay}
            <span>{tokenIn.symbol}</span>
          </div>
        </div>
        <div className="flexBetween">
          <span>Pool fee</span>
          <span>{poolFeeDisplay}</span>
        </div>
        <div className="flexBetween">
          <span>Minimum received</span>
          <span>{minAmountOutDisplay}</span>
        </div>
        <SwapRouter />
      </div>
    </div>
  );
}
