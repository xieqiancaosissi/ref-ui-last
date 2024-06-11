import { useEffect, useState } from "react";
import { useAccountStore } from "@/stores/account";
import { getAccountNearBalance } from "@/services/token";
import poolStyle from "@/components/pools/pool.module.css";
import { SearchIcon } from "@/components/pools/icon";
import Charts from "@/components/pools/charts/charts";

export default function Farms() {
  const accountStore = useAccountStore();
  const accountId = accountStore.getIsSignedIn();
  const [isActive, setActive] = useState("Classic");
  const poolTypeList = [
    {
      key: "Classic",
      value: "Classic",
    },
    {
      key: "Stable",
      value: "Stable",
    },
    {
      key: "DCL",
      value: "DCL",
    },
    {
      key: "Watchlist",
      value: "Watchlist",
    },
  ];

  return (
    <div>
      {/* charts & pools filter */}
      <div className={poolStyle.chartsContainter}>
        {/* line charts */}
        <div className="w-full frcc">
          <Charts title="TVL(Total Value Locked)"></Charts>
          <div className="ml-4 mr-4"></div>
          <Charts title="Volume(24h)"></Charts>
        </div>
        {/* filter tab & search input*/}
        <div className="w-full frcc mt-4">
          <div className="w-270 flex justify-between">
            {/* pool tab */}
            <div className={poolStyle.filterPoolType}>
              {poolTypeList.map((item, index) => {
                return (
                  <div
                    key={item.key + index}
                    className={`
                  ${
                    isActive == item.value
                      ? "text-white bg-poolsTypelinearGrayBg rounded"
                      : "text-gray-60"
                  }
                   w-25 h-8 frcc
                `}
                    onClick={() => {
                      setActive(item.value);
                    }}
                  >
                    {item.value}
                  </div>
                );
              })}
            </div>
            {/* search & create pool */}
            <div className="frcc">
              <div className={poolStyle.filterSeacrhInputContainer}>
                <div className={poolStyle.filterSearchInputBefore}>#</div>
                <input type="text" className={poolStyle.filterSearchInput} />
                <SearchIcon />
              </div>
              {/* create pool btn */}
              <div className={poolStyle.createPoolButton}>+ Create Pool</div>
            </div>
          </div>
        </div>
      </div>
      {/* classic */}

      {/* stable */}

      {/* dcl */}

      {/* watchlist */}
    </div>
  );
}
