import { useEffect, useMemo, useState } from "react";
import { TipIcon, SelectedIcon } from "./icons";
import { ArrowDownIcon } from "../../components/swap/icons";
import { V3_POOL_FEE_LIST } from "@/services/swapV3";
import { toInternationalCurrencySystem_usd } from "@/utils/uiNumber";
import { toPrecision, calculateFeePercent } from "@/utils/numbers";
import { usePersistLimitStore, IPersistLimitStore } from "@/stores/limitOrder";

export default function FeeTiers(props: any) {
  const [showFeeTiers, setShowFeeTiers] = useState(false);
  const persistLimitStore: IPersistLimitStore = usePersistLimitStore();
  const dclPool = persistLimitStore.getDclPool();
  useEffect(() => {
    const outClickEvent = (e: any) => {
      const path = e.composedPath();
      const el = path.find((el: any) => el.id == "feeTierId");
      if (!el) {
        hide();
      }
    };
    document.addEventListener("click", outClickEvent);
    return () => {
      document.removeEventListener("click", outClickEvent);
    };
  }, []);
  const feeDisplay = useMemo(() => {
    if (dclPool) {
      const feeDisplay = toPrecision(
        calculateFeePercent((dclPool?.fee || 0) / 100).toString(),
        2
      );
      return feeDisplay;
    }
    return "-";
  }, [dclPool?.pool_id]);
  function show() {
    setShowFeeTiers(true);
  }
  function hide() {
    setShowFeeTiers(false);
  }
  function switchStatus() {
    setShowFeeTiers(!showFeeTiers);
  }
  return (
    <div className="bg-dark-60 rounded border border-transparent hover:border-green-10 p-3.5">
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-50 whitespace-nowrap">
          Fee Tiers
        </span>
        <TipIcon className="text-gray-10 hover:text-white flex-shrink-0 cursor-pointer" />
      </div>
      <div
        className="relative flexBetween mt-2.5 cursor-pointer"
        id="feeTierId"
        onClick={switchStatus}
      >
        <span className="text-white text-base font-bold">{feeDisplay}%</span>
        <ArrowDownIcon
          className={`${
            showFeeTiers
              ? "transform rotate-180 text-primaryGreen"
              : "text-white"
          }`}
        />
        {/* fee Tiers */}
        <FeeTiersSelector showFeeTiers={showFeeTiers} onHide={hide} />
      </div>
    </div>
  );
}

function FeeTiersSelector({
  showFeeTiers,
  onHide,
}: {
  showFeeTiers: boolean;
  onHide: any;
}) {
  const persistLimitStore: IPersistLimitStore = usePersistLimitStore();
  const allDclPools = persistLimitStore.getAllDclPools();
  const dclPool = persistLimitStore.getDclPool();
  const [token_x, token_y] = dclPool?.pool_id?.split("|") || [];
  return (
    <div
      className={`absolute flex flex-col gap-1 -right-4 top-6 rounded-lg border border-gray-70 bg-dark-70 p-2.5 transform translate-y-5 ${
        showFeeTiers ? "" : "hidden"
      }`}
    >
      {V3_POOL_FEE_LIST.map((fee) => {
        const feeDisplay = toPrecision(
          calculateFeePercent(fee / 100).toString(),
          2
        );
        const pool_id = `${token_x}|${token_y}|${fee}`;
        const pool = allDclPools?.find((p) => p.pool_id == pool_id);
        const isSelected = pool?.pool_id == dclPool?.pool_id;
        const isNoPool = !pool?.pool_id;
        return (
          <div
            key={fee}
            className={`flexBetween text-xs text-white text-opacity-40 gap-20 whitespace-nowrap hover:bg-dark-10 px-2.5 py-1.5 rounded-md select-none ${
              isNoPool ? "cursor-not-allowed" : "cursor-pointer"
            } ${isSelected ? "bg-dark-10" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isNoPool && fee !== dclPool.fee) {
                persistLimitStore.setDclPool(pool);
              } else if (fee == dclPool.fee) {
                onHide();
              }
            }}
          >
            <div className="flex flex-col">
              <span>{feeDisplay}%</span>
              <span>
                TVL {!pool ? "-" : toInternationalCurrencySystem_usd(pool?.tvl)}
              </span>
            </div>
            <div>
              {isNoPool ? <span>No pool</span> : null}
              {isSelected ? <SelectedIcon /> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
