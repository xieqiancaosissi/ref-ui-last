import { useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useAccountStore } from "../../stores/account";
import { RedWarningIcon, ArrowDownIcon } from "./icons";

export default function SwapDetail() {
  const [show, setShow] = useState<boolean>(false);
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const walletLoading = accountStore.getWalletLoading();
  function showDetail() {
    setShow(!show);
  }
  return (
    <div className="mt-3 text-sm text-gray-50">
      {/* title */}
      <div className="flexBetween px-4">
        <span className="cursor-pointer">1ATO($1.00)≈0.0032 1INCH</span>
        <div
          className="flex items-center gap-1.5 cursor-pointer"
          onClick={showDetail}
        >
          <RedWarningIcon />
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
            <span className="text-sm text-red-10">-3%/-1.990</span> 1INCH
          </div>
        </div>
        <div className="flexBetween">
          <span>Pool fees</span>
          <span>0.3%/2.325 1INCH</span>
        </div>
        <div className="flexBetween">
          <span>Minimum received</span>
          <span>95.23 ATO</span>
        </div>
        <div className="flexBetween">
          <span>Route</span>
          <span>3 Steps in the Route</span>
        </div>
      </div>
    </div>
  );
}
