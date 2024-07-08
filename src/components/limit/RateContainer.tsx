import { useMemo, useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
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
  const tokenIn = limitStore.getTokenIn();
  const tokenOut = limitStore.getTokenOut();
  const isLock = limitStore.getLock();
  const dclPool = persistLimitStore.getDclPool();
  const symbolsArr = ["e", "E", "+", "-"];
  function changeAmount(e: any) {
    const amount = e.target.value;
    limitStore.setRate(amount);
  }
  function onBlurEvent() {
    const regularizedRate = regularizedPrice(
      rate,
      tokenIn,
      tokenOut,
      dclPool.fee
    );
    limitStore.setRate(toPrecision(regularizedRate, 8, false, false));
  }
  function onLock() {
    limitStore.setLock(true);
  }
  function onUnLock() {
    limitStore.setLock(false);
  }
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
          <AddIcon className="cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
