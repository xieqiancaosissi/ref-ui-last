import React from "react";
import HoverTip from "@/components/common/Tips";
import {
  useCanFarmV1,
  useCanFarmV2,
  useYourliquidity,
} from "@/hooks/useStableShares";
import { ShareInFarmV2 } from "./ShareInFarm";
import ShareNumber from "./ShareNumber";
import {
  AddLiquidityIconStable,
  RemoveLiquidityIconStable,
} from "../liquidity/icon";
import { useRouter } from "next/router";

export default function ShareContainer(props: any) {
  const { poolDetail, setShowAdd, setShowRemove } = props;
  const router = useRouter();
  const { farmCount: countV1, endedFarmCount: endedFarmCountV1 } = useCanFarmV1(
    poolDetail.id,
    true
  );

  const { farmCount: countV2, endedFarmCount: endedFarmCountV2 } = useCanFarmV2(
    poolDetail.id,
    true
  );
  const { farmStakeV1, farmStakeV2, userTotalShare } = useYourliquidity(
    poolDetail.id
  );
  const toSauce = (type: string) => {
    router.push(`/sauce/${type}/${router.query.id}`);
  };
  return (
    <div className="my-5 w-270 flex justify-between items-center">
      {/* left */}
      <div className="text-gray-60 text-sm font-normal flex">
        {/* get share */}
        <div className="frcc">
          <HoverTip
            msg={"Shares available / Total shares"}
            extraStyles={"w-46"}
          />
          <span>Shares</span>
          <p className="ml-2">
            <ShareNumber id={poolDetail.id} />
          </p>
        </div>

        <div className="frcc ml-10">
          {countV1 > endedFarmCountV1 || Number(farmStakeV1) > 0 ? (
            <ShareInFarmV2
              farmStake={farmStakeV1}
              userTotalShare={userTotalShare}
              version={"Legacy"}
            />
          ) : null}
          {countV2 > endedFarmCountV2 || Number(farmStakeV2) > 0 ? (
            <ShareInFarmV2
              farmStake={farmStakeV2}
              userTotalShare={userTotalShare}
              version={"Classic"}
              poolId={poolDetail.id}
              onlyEndedFarm={endedFarmCountV2 === countV2}
            />
          ) : null}
        </div>
      </div>
      {/* right liquidity button */}
      <div className="flex items-center justify-end">
        <div
          className="bg-primaryGreen text-black rounded p-2 h-7 opacity-90 frcc border border-transparent text-sm cursor-pointer hover:opacity-100"
          onClick={() => setShowAdd(true)}
        >
          Add Liquidity
          <AddLiquidityIconStable className="mx-1" />
        </div>
        <div
          className="bg-transparent rounded p-2 h-7 frcc border opacity-90 border-gray-40 text-sm ml-2  cursor-pointer hover:opacity-100"
          style={{ color: "#BCC9D2" }}
          onClick={() => setShowRemove(true)}
        >
          Remove Liquidity
          <RemoveLiquidityIconStable className="mx-1" />
        </div>
      </div>
    </div>
  );
}
