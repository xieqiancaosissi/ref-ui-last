import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getPoolsDetailById } from "@/services/pool";
import styles from "./style.module.css";
import TokenDetail from "@/components/pools/detail/stable/tokenDetail";
import { CollectStar } from "@/components/pools/icon";
import { getAllTokenPrices } from "@/services/farm";
import { useTokenMetadata } from "@/hooks/usePools";
import RecentTransaction from "@/components/pools/detail/stable/RecentTransaction";
import { addPoolToWatchList, removePoolFromWatchList } from "@/services/pool";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import NoContent from "@/components/common/NoContent";
import { useWatchList } from "@/hooks/useWatchlist";
import { usePoolStore } from "@/stores/pool";
import ShareContainer from "@/components/pools/detail/stable/ShareContainer";
import PieEcharts from "@/components/pools/detail/stable/PieEcharts";
import StableAdd from "@/components/pools/detail/liquidity/stable/StableAdd";
import StableRemove from "@/components/pools/detail/liquidity/stable/StableRemove";
import { useRiskTokens } from "@/hooks/useRiskTokens";

export default function StablePoolDetail() {
  const router = useRouter();
  const poolId = router.query.id || "";
  const poolStore = usePoolStore();
  const { pureIdList } = useRiskTokens();
  const { currentwatchListId, accountId } = useWatchList();
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

      if (currentwatchListId.length > 0) {
        setIsCollect(currentwatchListId.includes(poolId));
      }
    }
  }, [poolId, currentwatchListId]);

  useEffect(() => {
    getAllTokenPrices().then((res) => {
      setTokenPriceList(res);
    });
    poolStore.setPoolActiveTab("stable");
  }, []);

  const collectPool = () => {
    if (!accountId) window.modal.show();
    if (isCollect) {
      removePoolFromWatchList({ pool_id: poolId.toString() });
    } else {
      addPoolToWatchList({ pool_id: poolId.toString() });
    }
    setIsCollect((previos) => !previos);
  };

  const [showAdd, setShowAdd] = useState(false);
  const hideAdd = () => {
    setShowAdd(false);
  };

  return (
    <div className="w-full fccc h-full">
      <div
        className="w-full fccc "
        style={{
          background: "rgba(33, 43, 53, 0.4)",
        }}
      >
        {/* return */}
        <div className="w-270 cursor-pointer text-base text-gray-60 mb-3 mt-8 hover:text-white">
          <span onClick={() => router.push("/pools")}>{`<  Pools`}</span>
        </div>

        {/* title */}
        <div className="w-270 min-h-10 flex items-center">
          {poolDetail && updatedMapList?.length > 0 && (
            <>
              <TokenDetail {...poolDetail} updatedMapList={updatedMapList} />
              {/*  */}
              <span className=" text-2xl text-white font-bold ml-1 mr-2">
                {poolDetail?.token_symbols
                  ?.map((item: any) =>
                    item == "wNEAR" ? (item = "NEAR") : item
                  )
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
                iscollect={!accountId ? "false" : isCollect.toString()}
                className="cursor-pointer"
                onClick={() => collectPool()}
              />
            </>
          )}
        </div>

        {/* share and liquidity action */}
        {poolDetail && (
          <ShareContainer poolDetail={poolDetail} setShowAdd={setShowAdd} />
        )}
      </div>
      {/* main */}
      <div className="fccc w-270 mt-2">
        {poolDetail && updatedMapList?.length > 0 ? (
          <PieEcharts
            poolDetail={poolDetail}
            tokenPriceList={tokenPriceList}
            updatedMapList={updatedMapList}
          />
        ) : (
          <NoContent tips="Charts is Loading..." h="h-90" />
        )}

        {/* Recent Transaction */}
        <div className="mb-10">
          <div className="mb-4 flex justify-between w-215">
            <span className="text-lg text-gray-50 font-bold">
              Recent Transaction
            </span>
            <div className="flex items-center mr-0.5">
              {TransactionTabList.map((item, index) => {
                return (
                  <div
                    key={item.key + "_" + index}
                    onClick={() => setTransactionActive(item.key)}
                    className={`cursor-pointer border border-gray-40 frcc text-sm font-medium px-2 py-1 rounded hover:text-white ${
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
          {poolDetail && updatedMapList?.length > 0 ? (
            <RecentTransaction
              activeTab={transactionActive}
              poolId={poolId}
              updatedMapList={updatedMapList}
            />
          ) : (
            <SkeletonTheme
              baseColor="rgba(33, 43, 53, 0.3)"
              highlightColor="rgba(33, 43, 53, 0.4)"
            >
              <Skeleton width={860} height={50} count={10}></Skeleton>
            </SkeletonTheme>
          )}
        </div>
      </div>
      {/* add */}
      {updatedMapList && poolDetail && (
        <StableAdd
          isOpen={showAdd}
          onRequestClose={hideAdd}
          poolDetail={poolDetail}
          pureIdList={pureIdList}
          updatedMapList={updatedMapList}
        />
      )}
    </div>
  );
}
