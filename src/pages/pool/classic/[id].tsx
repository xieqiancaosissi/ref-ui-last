import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getPoolsDetailById } from "@/services/pool";

export default function ClassicPoolDetail() {
  const router = useRouter();
  const poolId = router.query.id || "";
  const [poolDetail, setPoolDetail] = useState(null);
  useEffect(() => {
    // poolId && console.log(poolId, "router");
    if (poolId) {
      getPoolsDetailById({ pool_id: poolId as any }).then((res) => {
        setPoolDetail(res);
      });
    }
  }, [poolId]);
  return (
    <div className="w-270">
      {/* return */}
      <div></div>

      {/* title */}
      <div></div>
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
