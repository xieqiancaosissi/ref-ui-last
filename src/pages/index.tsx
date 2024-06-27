import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  RefreshIcon,
  SWitchButton,
  CheckboxIcon,
} from "../components/swap/icons";
import Input from "../components/swap/Input";
import SwapDetail from "../components/swap/SwapDetail";
import swapStyles from "../components/swap/swap.module.css";
import {
  fetchPoolsAndCacheData,
  fetchStablePoolsAndCacheData,
} from "@/services/swap/swap";
import { fetchDclPoolsAndCacheData } from "@/services/swap/swapDcl";
import {
  POOL_REFRESH_INTERVAL,
  PRICE_IMPACT_RED_VALUE,
} from "@/utils/constant";
import useMultiSwap from "@/hooks/useMultiSwap";
import { getAllTokenPrices } from "@/services/farm";
import {
  useSwapStore,
  usePersistSwapStore,
  IPersistSwapStore,
} from "@/stores/swap";
import { toPrecision } from "@/utils/numbers";
import GetPriceImpact from "@/components/swap/GetPriceImpact";
import { getTokenUIId, is_near_wnear_swap } from "@/services/swap/swapUtils";
const SwapButton = dynamic(() => import("../components/swap/SwapButton"), {
  ssr: false,
});
const SetPopup = dynamic(() => import("../components/swap/SetPopup"), {
  ssr: false,
});
const InitData = dynamic(() => import("../components/swap/InitData"), {
  ssr: false,
});

export default function Swap() {
  const [isHighImpact, setIsHighImpact] = useState<boolean>(false);
  const [highImpactCheck, setHighImpactCheck] = useState<boolean>(false);
  const [pinLoading, setpinLoading] = useState<boolean>(false);
  const swapStore = useSwapStore();
  const persistSwapStore = usePersistSwapStore() as IPersistSwapStore;
  const tokenIn = swapStore.getTokenIn();
  const tokenOut = swapStore.getTokenOut();
  const tokenOutAmount = swapStore.getTokenOutAmount();
  const priceImpact = swapStore.getPriceImpact();
  const tokenInAmount = swapStore.getTokenInAmount();
  const isnearwnearSwap = is_near_wnear_swap(tokenIn, tokenOut);
  useMultiSwap({ supportDclQuote: false, supportLittlePools: false });
  useEffect(() => {
    const id = setInterval(reloadPools, POOL_REFRESH_INTERVAL);
    return () => {
      clearInterval(id);
    };
  }, []);
  useEffect(() => {
    getAllTokenPrices().then((res) => {
      swapStore.setAllTokenPrices(res);
    });
  }, []);
  useEffect(() => {
    if (Number(priceImpact || 0) > PRICE_IMPACT_RED_VALUE) {
      setIsHighImpact(true);
    } else {
      setIsHighImpact(false);
    }
  }, [priceImpact]);
  const priceImpactDisplay = useMemo(() => {
    try {
      return GetPriceImpact(priceImpact, tokenInAmount);
    } catch (error) {
      return null;
    }
  }, [priceImpact, tokenInAmount]);
  function onCheck() {
    setHighImpactCheck(!highImpactCheck);
  }
  function onSwitch() {
    swapStore.setTokenIn(tokenOut);
    swapStore.setTokenOut(tokenIn);
    persistSwapStore.setTokenInId(getTokenUIId(tokenOut));
    persistSwapStore.setTokenOutId(getTokenUIId(tokenIn));
  }
  const variants = {
    static: { transform: "rotate(0deg)" },
    spin: {
      transform: "rotate(360deg)",
      transition: { duration: 1, repeat: Infinity, ease: "linear" },
    },
  };
  async function reloadPools() {
    if (pinLoading) return;
    setpinLoading(true);
    const topPoolsPending = fetchPoolsAndCacheData();
    const stablePoolsPending = fetchStablePoolsAndCacheData();
    const dclPoolPending = fetchDclPoolsAndCacheData();
    Promise.all([topPoolsPending, stablePoolsPending, dclPoolPending])
      .catch()
      .finally(() => {
        setpinLoading(false);
      });
  }
  return (
    <main className="m-auto my-20 select-none" style={{ width: "420px" }}>
      <InitData />
      <div className="rounded-lg bg-dark-10 p-4">
        {/* set */}
        <div className="flex items-center justify-between">
          <span className="text-white font-bold text-xl">Swap</span>
          <div className="flex items-center gap-2 z-20">
            <span
              className={swapStyles.swapControlButton}
              onClick={reloadPools}
            >
              {pinLoading ? (
                <motion.span variants={variants} animate="spin">
                  <RefreshIcon className="text-white" />
                </motion.span>
              ) : (
                <RefreshIcon />
              )}
            </span>
            <SetPopup />
          </div>
        </div>
        {/* input part */}
        <div className="flex flex-col items-center mt-4">
          <Input token={tokenIn} isnearwnearSwap={isnearwnearSwap} isIn />
          <div
            className="flex items-center justify-center rounded w-7 h-7 cursor-pointer text-gray-50 hover:text-white  bg-dark-60 hover:bg-dark-10 -my-3.5 relative z-10 border-2 border-dark-10"
            onClick={onSwitch}
          >
            <SWitchButton />
          </div>
          <Input
            disable
            token={tokenOut}
            amountOut={
              isnearwnearSwap
                ? toPrecision(tokenOutAmount, 24)
                : toPrecision(
                    tokenOutAmount,
                    Math.min(8, tokenOut?.decimals ?? 8)
                  )
            }
            isOut
            className="mt-0.5"
          />
        </div>
        {/* high price tip */}
        {isHighImpact ? (
          <div className="flexBetween rounded border border-red-10 border-opacity-45 bg-red-10 bg-opacity-10 text-xs text-red-10 p-2 mt-4">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center rounded-sm border border-red-10 cursor-pointer ${
                  highImpactCheck ? "bg-red-10" : ""
                }`}
                style={{ width: "14px", height: "14px" }}
                onClick={onCheck}
              >
                <CheckboxIcon
                  className={`${highImpactCheck ? "" : "hidden"}`}
                />
              </div>
              I accept the price impact
            </div>
            <span className="flex items-center gap-1 font-bold">
              {priceImpactDisplay}
              {tokenIn.symbol}
            </span>
          </div>
        ) : null}

        {/* submit button */}
        <SwapButton
          isHighImpact={isHighImpact}
          highImpactCheck={highImpactCheck}
        />
      </div>
      {/* detail */}
      {!isnearwnearSwap ? <SwapDetail /> : null}
    </main>
  );
}
// SSR
export function getServerSideProps(context: any) {
  return {
    props: {
      data: "testdata",
    },
  };
}
