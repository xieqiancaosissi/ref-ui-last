import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getPoolsDetailById } from "@/services/pool";
import styles from "./style.module.css";
import TokenDetail from "@/components/pools/detail/classic/tokenDetail";
import { CollectStar } from "@/components/pools/icon";
import TokenFeeAndCureentPrice from "@/components/pools/detail/classic/tokenFeeAndCureentPrice";
import { getAllTokenPrices } from "@/services/farm";

export default function ClassicPoolDetail() {
  const router = useRouter();
  const poolId = router.query.id || "";
  const [poolDetail, setPoolDetail] = useState<any>(null);
  const [isCollect, setIsCollect] = useState(false);
  const [tokenPriceList, setTokenPriceList] = useState<any>(null);

  useEffect(() => {
    if (poolId) {
      getPoolsDetailById({ pool_id: poolId as any }).then((res) => {
        setPoolDetail(res);
      });
    }
  }, [poolId]);

  useEffect(() => {
    getAllTokenPrices().then((res) => {
      // console.log(res);
      setTokenPriceList(res);
    });
  }, []);

  const collectPool = () => {
    console.log("....");
    setIsCollect((previos) => !previos);
  };

  return (
    <div className="w-full fccc h-full">
      {/* return */}
      <div
        className="w-270 cursor-pointer text-base text-gray-60 mb-3 mt-8"
        onClick={() => router.push("/pools")}
      >{`<  Pools`}</div>

      {/* title */}
      <div className="w-270 flex items-center">
        {poolDetail && (
          <>
            <TokenDetail {...poolDetail}></TokenDetail>
            <span className=" text-2xl text-white font-bold ml-1 mr-2">
              {poolDetail.token_symbols
                .map((item: any) => (item == "wNEAR" ? (item = "NEAR") : item))
                .join("-")}
            </span>
            <CollectStar
              isCollect={isCollect}
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
      <div>
        {/* left */}

        <div>
          {/* charts */}
          <div></div>

          {/* tvl & Overall locking */}
          <div></div>

          {/* Overall locking */}
          <div></div>

          {/* Recent Transaction */}
          <div></div>
        </div>

        {/* right liquidity */}
        <div></div>
      </div>
    </div>
  );
}
