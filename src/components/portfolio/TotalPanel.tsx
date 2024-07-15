import { useContext, useMemo } from "react";
import { TotalAssetsIcon } from "../menu/icons";
import { formatWithCommas_usd } from "@/utils/uiNumber";
import { OverviewData } from "./index";

export default function TotalPanel() {
  // const {
  //   netWorth,
  //   claimable,
  //   wallet_assets_value,
  //   burrow_borrowied_value,
  //   accountId,
  // } = useContext(OverviewData);
  return (
    <div className="mt-4 bg-gray-20 py-2.5 pl-2 pr-4 rounded-3xl h-11 flex items-end justify-between mb-8">
      <div className="frcc">
        <TotalAssetsIcon />
        <p className="text-sm	ml-2 text-gray-50 mt-4">Total Assets</p>
      </div>
      <div className="text-primaryGreen text-base paceGrotesk-Bold">
        {/* {formatWithCommas_usd(netWorth)} */}-
      </div>
    </div>
  );
}
