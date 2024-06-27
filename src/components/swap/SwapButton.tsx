import { useMemo, useState } from "react";
import Big from "big.js";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useAccountStore } from "@/stores/account";
import { ButtonTextWrapper } from "@/components/common/Button";
import swap from "@/services/swap/executeSwap";
import nearSwap from "@/services/swap/executeNearSwap";
import { usePersistSwapStore, useSwapStore } from "@/stores/swap";
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
    isnearwnearSwap,
  ]);
  function doSwap() {
    setSwapLoading(true);
    if (isnearwnearSwap) {
      nearSwap({
        tokenIn,
        tokenOut,
        amountIn,
      });
    } else {
      swap({
        tokenIn,
        tokenOut,
        swapsToDo: swapStore.getEstimates(),
        slippageTolerance,
        amountIn,
      });
    }
  }
  function getButtonStatus(): IButtonStatus {
    let status: IButtonStatus = "loading";
    const availableAmountIn = Big(amountIn || 0).lte(getMax(tokenIn, decimals));
    if (walletLoading) {
      status = "loading";
    } else if (!walletLoading && !accountId) {
      status = "unLogin";
    } else if (
      accountId &&
      tokenIn?.id &&
      tokenOut?.id &&
      Number(amountIn || 0) > 0 &&
      Number(amountOut || 0) > 0
    ) {
      if (!availableAmountIn) {
        status = "insufficient";
      } else if (isHighImpact && !highImpactCheck && !isnearwnearSwap) {
        status = "disabled";
      } else {
        status = "available";
      }
    } else {
      status = "disabled";
    }
    return status;
  }
  return (
    <>
      {buttonStatus == "loading" ? (
        <SkeletonTheme baseColor="#2A3643" highlightColor="#9EFF00">
          <Skeleton height={42} className="mt-4" />
        </SkeletonTheme>
      ) : null}
      {buttonStatus == "unLogin" ? (
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
      {buttonStatus == "insufficient" ? (
        <div
          className="flex items-center justify-center bg-gray-40 rounded mt-4 text-gray-50 font-bold text-base cursor-not-allowed"
          style={{ height: "42px" }}
        >
          Insufficient Balance
        </div>
      ) : null}
      {buttonStatus == "disabled" ? (
        <div
          className="flex items-center justify-center bg-gray-40 rounded mt-4 text-gray-50 font-bold text-base cursor-not-allowed"
          style={{ height: "42px" }}
        >
          Swap
        </div>
      ) : null}
      {buttonStatus == "available" ? (
        <div
          className="flex items-center justify-center bg-greenGradient rounded mt-4 text-black font-bold text-base cursor-pointer"
          style={{ height: "42px" }}
          onClick={doSwap}
        >
          <ButtonTextWrapper loading={swapLoading} Text={() => <>Swap</>} />
        </div>
      ) : null}
    </>
  );
}
