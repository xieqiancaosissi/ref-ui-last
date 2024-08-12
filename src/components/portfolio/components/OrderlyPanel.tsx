import { useContext } from "react";
import { PortfolioArrow, PortfolioOrderlyIcon } from "./icon";
import { OverviewContextType, OverviewData } from "../index";

export default function OrderlyPanel() {
  const { is_mobile } = useContext(OverviewData) as OverviewContextType;
  const handleOrderlyClick = () => {
    window.open("https://orderly.org/", "_blank");
  };

  return (
    <div
      className="bg-gray-20 bg-opacity-40 rounded-lg p-4 mb-4 hover:bg-gray-20 cursor-pointer text-white"
      onClick={() => {
        if (!is_mobile) {
          handleOrderlyClick();
        }
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
      <div className="flex">
        <div className="flex-1">
          <p className="mb-1.5 text-base paceGrotesk-Bold">-</p>
          <p className="text-xs text-gray-50">TotalAssets</p>
        </div>
      </div>
    </div>
  );
}
