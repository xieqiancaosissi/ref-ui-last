import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getPoolsDetailById } from "@/services/pool";
import styles from "./style.module.css";
import TokenDetail from "@/components/pools/detail/classic/tokenDetail";
import { CollectStar } from "@/components/pools/icon";
import TokenFeeAndCureentPrice from "@/components/pools/detail/classic/tokenFeeAndCureentPrice";
import { getAllTokenPrices } from "@/services/farm";
import TvlAndVolumeCharts from "@/components/pools/detail/classic/TvlAndVolumeCharts";
import OverallLocking from "@/components/pools/detail/classic/overallLocking";
import PoolComposition from "@/components/pools/detail/classic/PoolComposition";
import { useTokenMetadata } from "@/hooks/usePools";
import RecentTransaction from "@/components/pools/detail/classic/RecentTransaction";
import {
  addPoolToWatchList,
  removePoolFromWatchList,
  getWatchListFromDb,
} from "@/services/pool";
import NoLiquidity from "@/components/pools/detail/liquidity/NoLiquidity";

export default function ClassicPoolDetail() {
  const router = useRouter();
  const poolId = router.query.id || "";
  const [poolDetail, setPoolDetail] = useState<any>(null);
  const [isCollect, setIsCollect] = useState(false);
  const [tokenPriceList, setTokenPriceList] = useState<any>(null);
  const { updatedMapList } = useTokenMetadata([poolDetail]);
  const TransactionTabList = [
    { key: "swap", value: "Swap" },
    { key: "liquidity", value: "Liquidity" },
  ];
  const [transactionActive, setTransactionActive] = useState("swap");
  //
  useEffect(() => {
    if (poolId) {
      getPoolsDetailById({ pool_id: poolId as any }).then((res) => {
        setPoolDetail(res);
      });

      getWatchListFromDb({ pool_id: poolId.toString() }).then((watchlist) => {
        setIsCollect(watchlist.length > 0);
      });
    }
  }, [poolId]);

  useEffect(() => {
    getAllTokenPrices().then((res) => {
      setTokenPriceList(res);
    });
  }, []);

  const collectPool = () => {
    if (isCollect) {
      removePoolFromWatchList({ pool_id: poolId.toString() });
    } else {
      addPoolToWatchList({ pool_id: poolId.toString() });
    }
    setIsCollect((previos) => !previos);
  };

  return (
    <div className="w-full fccc h-full">
      {/* return */}
      <div className="w-270 cursor-pointer text-base text-gray-60 mb-3 mt-8">
        <span onClick={() => router.push("/pools")}>{`<  Pools`}</span>
      </div>

      {/* title */}
      <div className="w-270 flex items-center">
        {poolDetail && updatedMapList?.length > 0 && (
          <>
            <TokenDetail {...poolDetail} updatedMapList={updatedMapList} />
            <span className=" text-2xl text-white font-bold ml-1 mr-2">
              {poolDetail?.token_symbols
                ?.map((item: any) => (item == "wNEAR" ? (item = "NEAR") : item))
                .join("-")}
            </span>

            {/* farm tag */}
            {poolDetail.is_farm && (
              <div
                className={` bg-farmTagBg text-farmApyColor frcc text-xs italic w-13 h-5 rounded-xl mr-2`}
              >
                Farms
              </div>
            )}

            {/* watchlist */}
            <CollectStar
              iscollect={isCollect.toString()}
              className="cursor-pointer"
              onClick={() => collectPool()}
            />

            {/* fee */}
            <TokenFeeAndCureentPrice
              poolDetail={poolDetail}
              tokenPriceList={tokenPriceList}
            />
          </>
        )}
      </div>
      {/* main */}
      <div className="flex w-270 mt-2">
        {/* left */}

        <div className="w-183">
          {/* charts */}
          <div className="min-h-135">
            {poolDetail && <TvlAndVolumeCharts poolId={poolId} />}
          </div>

          {/* tvl & Overall locking */}
          <div className="-mt-20">
            {poolDetail && updatedMapList?.length > 0 && (
              <OverallLocking
                poolDetail={poolDetail}
                updatedMapList={updatedMapList}
              />
            )}
          </div>

          {/* Pool composition */}
          <div>
            <h3 className="mt-12 mb-4 text-lg text-gray-50 font-bold">
              Pool Composition
            </h3>
            {poolDetail && updatedMapList?.length > 0 && (
              <PoolComposition
                poolDetail={poolDetail}
                tokenPriceList={tokenPriceList}
                updatedMapList={updatedMapList}
              />
            )}
          </div>

          {/* Recent Transaction */}
          <div>
            <div className="mt-12 mb-4 flex justify-between">
              <span className="text-lg text-gray-50 font-bold">
                Recent Transaction
              </span>
              <div className="flex items-center mr-0.5">
                {TransactionTabList.map((item, index) => {
                  return (
                    <div
                      key={item.key + "_" + index}
                      onClick={() => setTransactionActive(item.key)}
                      className={`cursor-pointer border border-gray-40 frcc text-sm font-medium px-2 py-1 rounded ${
                        item.key == transactionActive
                          ? "text-white bg-gray-40"
                          : "text-gray-60 bg-transparent"
                      } ${index == 0 ? "mr-2" : ""}`}
                    >
                      {item.value}
                    </div>
                  );
                })}
              </div>
            </div>
            {/*  */}
            {poolDetail && updatedMapList?.length > 0 && (
              <RecentTransaction
                activeTab={transactionActive}
                poolId={poolId}
                updatedMapList={updatedMapList}
              />
            )}
          </div>
        </div>

        {/* right liquidity */}
        <div className="w-80 ml-auto pt-12">
          <NoLiquidity />
        </div>
      </div>
    </div>
  );
}
