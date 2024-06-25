import { useMemo, useState } from "react";
import Big from "big.js";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useAccountStore } from "@/stores/account";
import { ButtonTextWrapper } from "@/components/common/Button";
import swap from "@/services/swap/executeSwap";
import { usePersistSwapStore, useSwapStore } from "@/stores/swap";
import { getMax } from "@/services/swap/swapUtils";
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
  const slippageTolerance = persistSwapStore.getSlippage();
  const buttonStatus = useMemo(() => {
    return getButtonStatus();
  }, [
    tokenIn?.id,
    tokenOut?.id,
    amountIn,
    slippageTolerance,
    walletLoading,
    isHighImpact,
    highImpactCheck,
  ]);
  function doSwap() {
    setSwapLoading(true);
    const estimates = swapStore.getEstimates();
    swap({
      tokenIn,
      tokenOut,
      swapsToDo: estimates,
      slippageTolerance,
      amountIn,
    });
  }
  function getButtonStatus(): IButtonStatus {
    let status: IButtonStatus = "loading";
    const availableAmountIn = Big(amountIn || 0).lte(getMax(tokenIn));
    if (walletLoading) {
      status = "loading";
    } else if (!walletLoading && !accountId) {
      status = "unLogin";
    } else if (
      accountId &&
      tokenIn.id &&
      tokenOut.id &&
      Number(amountIn || 0) > 0
    ) {
      if (!availableAmountIn) {
        status = "insufficient";
      } else if (isHighImpact && !highImpactCheck) {
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
