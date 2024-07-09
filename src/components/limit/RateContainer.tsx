import { useEffect, useMemo, useState } from "react";
import Big from "big.js";
import { SubIcon, AddIcon, UnLockIcon, LockIcon } from "./icons";
import {
  useLimitStore,
  usePersistLimitStore,
  IPersistLimitStore,
} from "@/stores/limitOrder";
import { regularizedPrice } from "@/services/swapV3";
import { toPrecision } from "@/utils/numbers";

export default function RateContainer() {
  const limitStore = useLimitStore();
  const persistLimitStore = usePersistLimitStore() as IPersistLimitStore;
  const rate = limitStore.getRate();
  const marketRate = limitStore.getMarketRate();
  const tokenIn = limitStore.getTokenIn();
  const tokenOut = limitStore.getTokenOut();
  const isLock = limitStore.getLock();
  const tokenInAmount = limitStore.getTokenInAmount();
  const dclPool = persistLimitStore.getDclPool();
  const symbolsArr = ["e", "E", "+", "-"];
  const rateDiffDom = useMemo(() => {
    if (Number(rate) > 0 && Number(marketRate) > 0) {
      if (Big(rate).eq(marketRate)) return null;
      const rateDiff = new Big(rate).minus(marketRate).div(marketRate).mul(100);
      return (
        <span
          className={`${
            rateDiff.gt(0)
              ? "text-primaryGreen"
              : rateDiff.lte(-10)
              ? "text-red-20"
              : "text-yellow-10"
          }`}
        >
          (
          {rateDiff.gt(1000)
            ? ">1000"
            : rateDiff.lt(-1000)
            ? "<-1000"
            : rateDiff.toFixed(2, 0)}
          %)
        </span>
      );
    }
    return null;
  }, [rate, marketRate]);
  function changeAmount(e: any) {
    const amount = e.target.value;
    limitStore.onRateChangeTrigger({
      amount,
      tokenInAmount,
      limitStore,
    });
  }
  function onBlurEvent() {
    const regularizedRate = regularizedPrice(
      rate,
      tokenIn,
      tokenOut,
      dclPool.fee
    );
    limitStore.onRateChangeTrigger({
      amount: toPrecision(regularizedRate, 8, false, false),
      tokenInAmount,
      limitStore,
    });
  }
  function onLock() {
    limitStore.setLock(true);
  }
  function onUnLock() {
    limitStore.setLock(false);
  }
  function addOneSlot() {
    const regularizedRate = regularizedPrice(
      rate,
      tokenIn,
      tokenOut,
      dclPool.fee,
      1
    );
    limitStore.onRateChangeTrigger({
      amount: toPrecision(regularizedRate, 8, false, false),
      tokenInAmount,
      limitStore,
    });
  }
  function subOneSlot() {
    const regularizedRate = regularizedPrice(
      rate,
      tokenIn,
      tokenOut,
      dclPool.fee,
      -1
    );
    limitStore.onRateChangeTrigger({
      amount: toPrecision(regularizedRate, 8, false, false),
      tokenInAmount,
      limitStore,
    });
  }
  function fetch_market_price() {
    limitStore.setRate(marketRate);
    limitStore.onFetchPool({
      limitStore,
      dclPool,
      persistLimitStore,
    });
  }
  return (
    <div className="bg-dark-60 rounded w-3/4 border border-transparent hover:border-green-10 p-3.5 text-sm text-gray-50">
      <div className="flexBetween">
        <div className="flex items-center gap-0.5">
          <span>Buy in rate</span>
          {rateDiffDom}
        </div>
        <span
          className="underline hover:text-primaryGreen cursor-pointer"
          onClick={fetch_market_price}
        >
          Market Price
        </span>
      </div>
      <div className="flexBetween mt-2.5 gap-2">
        <SubIcon
          onClick={subOneSlot}
          className="cursor-pointer text-gray-60 hover:text-white"
        />
        <div className="flexBetween">
          <input
            value={rate || "-"}
            type="number"
            className="text-white text-base font-bold text-center"
            onChange={changeAmount}
            placeholder="0.0"
            onKeyDown={(e) => symbolsArr.includes(e.key) && e.preventDefault()}
            onBlur={onBlurEvent}
          />
          <span>USDC.e</span>
        </div>
        <div className="flex items-center gap-1">
          {isLock ? (
            <LockIcon
              className="cursor-pointer text-primaryGreen hover:text-white"
              onClick={onUnLock}
            />
          ) : (
            <UnLockIcon
              className="cursor-pointer text-gray-60 hover:text-white"
              onClick={onLock}
            />
          )}
          <AddIcon
            onClick={addOneSlot}
            className="cursor-pointer text-gray-60 hover:text-white"
          />
        </div>
      </div>
    </div>
  );
}
