import SeeAll from "./seeAll";
import { useSpotStore } from "@/stores/spot";
import { NearIcon, OrderlyIcon } from "../icons";

export default function Account() {
  const spotStore = useSpotStore();
  const orderTab = spotStore.getOrderTab();
  const isLimit = orderTab == "LIMIT";
  const isMarket = orderTab == "MARKET";

  return (
    <div className="mt-10">
      <div className="flexBetween">
        <span className="text-lg font-bold bg-textWhiteGradient text-transparent bg-clip-text">
          Balance
        </span>
        <SeeAll />
      </div>
      <div className="bg-dark-10 bg-opacity-40 p-4 rounded-lg mt-3">
        <div className="grid grid-cols-3 text-sm text-gray-60">
          <span>Assets</span>
          <span className="flex items-center gap-1 justify-self-center">
            <NearIcon />
            Wallet
          </span>
          <span className="flex items-center gap-1 justify-self-end">
            <OrderlyIcon />
            Available
          </span>
        </div>
        <div className="grid grid-cols-3 text-sm text-gray-60 mt-3.5">
          <span>NEAR</span>
          <span className="flex items-center gap-1 justify-self-center">
            54.678
          </span>
          <span className="flex items-center gap-1 justify-self-end">
            0.009
          </span>
        </div>
        <div className="grid grid-cols-3 text-sm text-gray-60 mt-3.5">
          <span>NEAR</span>
          <span className="flex items-center gap-1 justify-self-center">
            54.678
          </span>
          <span className="flex items-center gap-1 justify-self-end">
            0.009
          </span>
        </div>
      </div>
    </div>
  );
}
