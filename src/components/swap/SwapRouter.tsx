import { useState } from "react";
import { useSwapStore } from "@/stores/swap";
import { TokenMetadata } from "@/services/ft-contract";
import { RefMarketIcon, ArrowTopRightIcon, ArrowRightIcon } from "./icons";
import TradeRouteModal from "./TradeRouteModal";

export default function SwapRouter() {
  const [showRouteDetail, setShowRouteDetail] = useState<boolean>(false);
  const swapStore = useSwapStore();
  const estimates = swapStore.getEstimates();
  function showDetailModal() {
    setShowRouteDetail(true);
  }
  function closeDetailModal() {
    setShowRouteDetail(false);
  }
  if (!estimates?.length) return null;
  return (
    <div className="flexBetween">
      <span>Route</span>
      <div
        onClick={showDetailModal}
        className="flex items-center gap-1.5 border border-gray-90 rounded p-0.5 pr-1 text-xs text-gray-160 hover:text-white hover:bg-dark-10 cursor-pointer"
      >
        <RefMarketIcon />
        <span className="w-px h-2 bg-gray-160"></span>
        {estimates.length > 2 ? (
          <span>{estimates.length} Steps in the Route</span>
        ) : (
          <div className="flex items-center gap-1">
            {estimates[0].tokens?.map((token: TokenMetadata, index) => {
              return (
                <div className="flex items-center gap-1" key={token.id}>
                  <img
                    style={{ width: "14px", height: "14px" }}
                    className="border border-dark-100 rounded-full"
                    src={token.icon}
                  />
                  {index == (estimates[0].tokens?.length ?? 0) - 1 ? null : (
                    <ArrowRightIcon />
                  )}
                </div>
              );
            })}
          </div>
        )}
        <ArrowTopRightIcon />
      </div>
      {showRouteDetail ? (
        <TradeRouteModal isOpen={true} onRequestClose={closeDetailModal} />
      ) : null}
    </div>
  );
}
