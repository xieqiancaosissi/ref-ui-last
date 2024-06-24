import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import tokenIcons from "@/utils/tokenIconConfig";
import { getPoolsDetailById } from "@/services/pool";
import { TokenIconComponent } from "@/components/pools/TokenIconWithTkn/index";
import { useRiskTokens } from "@/hooks/useRiskTokens";
import { useTokenMetadata } from "@/hooks/usePools";
import styles from "./style.module.css";
import TokenDetail from "@/components/pools/detail/classic/tokenDetail";
import { CollectStar } from "@/components/pools/icon";

export default function ClassicPoolDetail() {
  const router = useRouter();
  const poolId = router.query.id || "";
  const [poolDetail, setPoolDetail] = useState<any>(null);
  const [isCollect, setIsCollect] = useState(false);

  useEffect(() => {
    // poolId && console.log(poolId, "router");
    if (poolId) {
      getPoolsDetailById({ pool_id: poolId as any }).then((res) => {
        setPoolDetail(res);
      });
    }
  }, [poolId]);

  //   useEffect(() => {
  //     console.log(updatedMapList, "updatedMapList");
  //   }, [updatedMapList]);
  return (
    <div className="w-full fccc h-full">
      {/* return */}
      <div className="w-270 cursor-pointer text-base text-gray-60 mb-3 mt-8">{`<  Pools`}</div>

      {/* title */}
      <div>
        {poolDetail && <TokenDetail {...poolDetail}></TokenDetail>}
        {poolDetail && <span>{poolDetail.token_symbols.join("-")}</span>}
        <CollectStar isCollect={isCollect} />
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
