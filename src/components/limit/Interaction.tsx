import { useEffect, useState } from "react";
import Big from "big.js";
import {
  pointToPrice,
  regularizedPoint,
  regularizedPrice,
  feeToPointDelta,
} from "@/services/swapV3";
import {
  toPrecision,
  scientificNotationToString,
  ONLY_ZEROS,
} from "@/utils/numbers";
import {
  useLimitStore,
  usePersistLimitStore,
  IPersistLimitStore,
} from "@/stores/limitOrder";

export default function Interaction() {
  const limitStore = useLimitStore();
  const persistLimitStore: IPersistLimitStore = usePersistLimitStore();
  const dclPool = persistLimitStore.getDclPool();
  const tokenIn = limitStore.getTokenIn();
  const tokenOut = limitStore.getTokenOut();
  const tokenInAmount = limitStore.getTokenInAmount();
  const tokenOutAmount = limitStore.getTokenOutAmount();
  const isLock = limitStore.getLock();
  const rate = limitStore.getRate();
  // init
  useEffect(() => {
    if (dclPool?.pool_id && tokenIn?.id && tokenOut?.id) {
      const { current_point, pool_id, fee } = dclPool;
      const [token_x, token_y] = pool_id.split("|");
      const point = token_x == tokenIn.id ? current_point : current_point * -1;
      const regularPoint = regularizedPoint(point, fee);
      const price = pointToPrice({
        tokenA: tokenIn,
        tokenB: tokenOut,
        point:
          point === regularPoint
            ? regularPoint
            : regularPoint + feeToPointDelta(fee),
      });
      const rate = toPrecision(price, 8); // TODO is to little ??
      limitStore.setRate(rate);
      limitStore.setTokenInAmount("1");
      limitStore.setTokenOutAmount(rate);
    }
  }, [dclPool?.pool_id, tokenIn?.id, tokenOut?.id]);

  useEffect(() => {
    if (Big(tokenInAmount || 0).lte(0)) {
      limitStore.setTokenOutAmount("0");
    } else {
      getAmountOut(rate, tokenInAmount);
    }
  }, [tokenInAmount]);
  useEffect(() => {
    const curAmount = toPrecision(tokenOutAmount, 8, false, false);
    if (isLock) {
      if (Big(rate || 0).gt(0)) {
        const newAmountIn = new Big(curAmount || 0).div(rate).toFixed();
        limitStore.setTokenInAmount(toPrecision(newAmountIn, 8, false, false));
      }
    } else {
      if (Big(tokenInAmount || 0).gt(0)) {
        const newRate = toPrecision(
          new Big(curAmount || "0").div(tokenInAmount).toFixed(),
          8
        );
        limitStore.setRate(newRate);
      }
    }
  }, [tokenOutAmount]);
  useEffect(() => {
    if (Big(rate || 0).lte(0)) {
      limitStore.setTokenOutAmount("0");
    } else {
      getAmountOut(rate, tokenInAmount);
    }
  }, [rate]);
  function getAmountOut(rate: string, tokenInAmount: string) {
    let amountOut = new Big(rate || 0).mul(tokenInAmount || 0).toFixed();
    const minValue = "0.00000001";
    if (new Big(amountOut).gte(minValue)) {
      amountOut = toPrecision(amountOut, 8, false, false);
    }
    limitStore.setTokenOutAmount(amountOut);
  }
  return null;
}
