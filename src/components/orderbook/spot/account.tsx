import SeeAll from "./seeAll";
import { useSpotStore } from "@/stores/spot";
import { NearIcon, OrderlyIcon, DepositIcon, WithdrawIcon } from "../icons";
import orderbookStyle from "../orderbook.module.css";

export default function Account() {
  const spotStore = useSpotStore();
  const orderTab = spotStore.getOrderTab();
  return (
    <div className="mt-10">
      <div className="flexBetween">
        <span className="text-lg font-bold bg-textWhiteGradient text-transparent bg-clip-text">
          Balance
        </span>
        <SeeAll />
      </div>
      <div className="bg-dark-10 bg-opacity-40 p-4 rounded-lg mt-3">
        <div>
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
        {/* button areas */}
        <div className="flexBetween gap-3 mt-6">
          <div className={orderbookStyle.actionButton}>
            Deposit
            <DepositIcon />
          </div>
          <div className={orderbookStyle.actionButton}>
            Withdraw
            <WithdrawIcon />
          </div>
        </div>
      </div>
    </div>
  );
}
