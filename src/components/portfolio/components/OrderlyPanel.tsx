import { PortfolioArrow, PortfolioOrderlyIcon } from "./icon";
import { useOrderbookDataStore } from "@/stores/orderbook/orderbookDataStore";
import ConnectToOrderlyWidget from "@/components/orderbook/connectToOrderlyWidget";
import useHoldings from "@/hooks/orderbook/useHoldings";
import { toInternationalCurrencySystem_usd } from "@/utils/uiNumber";
import { isMobile } from "@/utils/device";

export default function OrderlyPanel() {
  const orderbookDataStore = useOrderbookDataStore();
  const connectStatus = orderbookDataStore.getConnectStatus();
  const totalAssetsUsd = useHoldings();
  const is_mobile = isMobile();
  const handleOrderlyClick = () => {
    window.open("https://app.ref.finance/orderly", "_blank");
  };
  return (
    <div
      className="bg-gray-20 bg-opacity-40 rounded-lg p-4 mb-4 hover:bg-gray-20 cursor-pointer text-white"
      onClick={() => {
        handleOrderlyClick();
      }}
    >
      <div className="frcb mb-6">
        <div className="flex items-center">
          <div className="bg-gray-220 bg-opacity-60 rounded-md w-6 h-6 mr-2 frcc">
            <PortfolioOrderlyIcon />
          </div>
          <p className="text-gray-10 text-sm">Orderly</p>
        </div>
        <PortfolioArrow />
      </div>
      <ConnectToOrderlyWidget uiType="orderlyAssets" />
      {connectStatus == "has_connected" ? (
        <div className="flex">
          <div className="flex-1">
            <p className="mb-1.5 text-base paceGrotesk-Bold">
              {toInternationalCurrencySystem_usd(totalAssetsUsd, 0)}
            </p>
            <p className="text-xs text-gray-50">TotalAssets</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
