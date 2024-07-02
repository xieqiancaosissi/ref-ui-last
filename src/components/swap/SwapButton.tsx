import { useEffect, useMemo, useState } from "react";
import Big from "big.js";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useAccountStore } from "@/stores/account";
import { ButtonTextWrapper } from "@/components/common/Button";
import swap from "@/services/swap/executeSwap";
import nearSwap from "@/services/swap/executeNearSwap";
import dclSwap from "@/services/swap/executeDclSwap";
import { usePersistSwapStore, useSwapStore } from "@/stores/swap";
import { toReadableNumber, percentLess } from "@/utils/numbers";
import { getV3PoolId } from "@/services/swap/swapDclUtils";
import {
  getMax,
  is_near_wnear_swap,
  getTokenUIId,
} from "@/services/swap/swapUtils";
import { IButtonStatus } from "@/interfaces/swap";

export default function SwapButton({
  isHighImpact,
  highImpactCheck,
}: {
  isHighImpact: boolean;
  highImpactCheck: boolean;
}) {
  const [swapLoading, setSwapLoading] = useState<boolean>(false);
  const accountStore = useAccountStore();
  const swapStore = useSwapStore();
  const persistSwapStore = usePersistSwapStore();
  const accountId = accountStore.getAccountId();
  const walletLoading = accountStore.getWalletLoading();
  const tokenIn = swapStore.getTokenIn();
  const tokenOut = swapStore.getTokenOut();
  const amountIn = swapStore.getTokenInAmount();
  const amountOut = swapStore.getTokenOutAmount();
  const estimatesDcl = swapStore.getEstimatesDcl();
  const estimating = swapStore.getEstimating();
  const swapError = swapStore.getSwapError();
  const best = swapStore.getBest();
  const slippageTolerance = persistSwapStore.getSlippage();
  const isnearwnearSwap = is_near_wnear_swap(tokenIn, tokenOut);
  const decimals = isnearwnearSwap ? 24 : undefined;
  const buttonStatus = useMemo(() => {
    return getButtonStatus();
  }, [
    getTokenUIId(tokenIn),
    getTokenUIId(tokenOut),
    amountIn,
    amountOut,
    slippageTolerance,
    walletLoading,
    isHighImpact,
    highImpactCheck,
    accountId,
    swapError?.message,
    isnearwnearSwap,
  ]);
  const loading = useMemo(() => {
    return swapLoading || estimating;
  }, [swapLoading, estimating]);
  function doSwap() {
    setSwapLoading(true);
    if (isnearwnearSwap) {
      nearSwap({
        tokenIn,
        tokenOut,
        amountIn,
      });
    } else if (best == "v1") {
      swap({
        tokenIn,
        tokenOut,
        swapsToDo: swapStore.getEstimates(),
        slippageTolerance,
        amountIn,
      });
    } else if (best == "v3") {
      const bestFee = Number(estimatesDcl?.tag?.split("|")?.[1] ?? 0);
      dclSwap({
        Swap: {
          pool_ids: [getV3PoolId(tokenIn.id, tokenOut.id, bestFee)],
          min_output_amount: percentLess(
            slippageTolerance,
            estimatesDcl?.amount as string
          ),
        },
        swapInfo: {
          tokenA: tokenIn,
          tokenB: tokenOut,
          amountA: amountIn,
          amountB: toReadableNumber(tokenOut.decimals, estimatesDcl?.amount),
        },
      });
    }
  }
  function getButtonStatus(): IButtonStatus {
    let status: IButtonStatus = "walletLoading";
    const availableAmountIn = Big(amountIn || 0).lte(getMax(tokenIn, decimals));
    if (walletLoading) {
      status = "walletLoading";
    } else if (!walletLoading && !accountId) {
      status = "unLogin";
    } else if ((isHighImpact && !highImpactCheck) || swapError?.message) {
      status = "disabled";
    } else if (accountId && Number(amountIn || 0) > 0 && !availableAmountIn) {
      status = "insufficient";
    } else if (tokenIn?.id == tokenOut?.id && !isnearwnearSwap) {
      status = "disabled";
    } else if (
      accountId &&
      tokenIn?.id &&
      tokenOut?.id &&
      Number(amountIn || 0) > 0
    ) {
      status = "available";
    } else {
      status = "disabled";
    }
    return status;
  }
  return (
    <>
      {buttonStatus == "walletLoading" ? (
        <SkeletonTheme baseColor="#2A3643" highlightColor="#9EFF00">
          <Skeleton height={42} className="mt-4" />
        </SkeletonTheme>
      ) : null}
      {buttonStatus == "unLogin" && !loading ? (
        <div
          className="flex items-center justify-center bg-greenGradient rounded mt-4 text-black font-bold text-base cursor-pointer"
          style={{ height: "42px" }}
          onClick={() => {
            window.modal.show();
          }}
        >
          Connect Wallet
        </div>
      ) : null}
      {buttonStatus == "insufficient" && !loading ? (
        <div
          className="flex items-center justify-center bg-gray-40 rounded mt-4 text-gray-50 font-bold text-base cursor-not-allowed"
          style={{ height: "42px" }}
        >
          Insufficient Balance
        </div>
      ) : null}
      {buttonStatus == "disabled" && !loading ? (
        <div
          className="flex items-center justify-center bg-gray-40 rounded mt-4 text-gray-50 font-bold text-base cursor-not-allowed"
          style={{ height: "42px" }}
        >
          Swap
        </div>
      ) : null}
      {buttonStatus == "available" || loading ? (
        <div
          className={`flex items-center justify-center bg-greenGradient rounded mt-4 text-black font-bold text-base ${
            loading ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
          }`}
          style={{ height: "42px" }}
          onClick={() => {
            if (!loading) {
              doSwap();
            }
          }}
        >
          <ButtonTextWrapper loading={loading} Text={() => <>Swap</>} />
        </div>
      ) : null}
    </>
  );
}
