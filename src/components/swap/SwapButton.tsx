import { useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useAccountStore } from "../../stores/account";
import { ButtonTextWrapper } from "../../components/common/Button";

export default function SwapButton() {
  const [swapLoading, setSwapLoading] = useState<boolean>(false);
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const walletLoading = accountStore.getWalletLoading();
  function doSwap() {
    setSwapLoading(true);
    console.log();
  }
  return (
    <>
      {accountId ? (
        <div
          className="flex items-center justify-center bg-greenGradient rounded mt-4 text-black font-bold text-base cursor-pointer"
          style={{ height: "42px" }}
          onClick={doSwap}
        >
          <ButtonTextWrapper loading={swapLoading} Text={() => <>Swap</>} />
        </div>
      ) : (
        <>
          {walletLoading ? (
            <SkeletonTheme baseColor="#2A3643" highlightColor="#9EFF00">
              <Skeleton height={42} className="mt-4" />
            </SkeletonTheme>
          ) : (
            <div
              className="flex items-center justify-center bg-greenGradient rounded mt-4 text-black font-bold text-base cursor-pointer"
              style={{ height: "42px" }}
              onClick={() => {
                window.modal.show();
              }}
            >
              Connect Wallet
            </div>
          )}
        </>
      )}
    </>
  );
}
