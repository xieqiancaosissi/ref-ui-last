import React, { useState, useEffect } from "react";
import { canFarmV1, canFarmV2 } from "@/services/pool_detail";
import { usePool } from "./usePools";
import BigNumber from "bignumber.js";

export const useFarmStake = ({
  poolId,
  stakeList,
}: {
  poolId: number;
  stakeList: Record<string, string>;
}) => {
  const [farmStake, setFarmStake] = useState<string>("0"); //
  useEffect(() => {
    let totalFarmStake = new BigNumber("0"); //
    Object.keys(stakeList).forEach((seed) => {
      const id = Number(seed.split("@")[1]);
      if (id == poolId) {
        totalFarmStake = totalFarmStake.plus(new BigNumber(stakeList[seed])); //
      }
    });
    setFarmStake(totalFarmStake.toString()); //
  }, [poolId, stakeList]); //

  return farmStake;
};

export const useCanFarmV1 = (poolId: number, withEnded?: boolean) => {
  const [farmCount, setFarmCount] = useState<number>(0);
  const [farmVersion, setFarmVersion] = useState<string>("");
  const [endedFarmCount, setEndedFarmCount] = useState<number>(0);

  useEffect(() => {
    canFarmV1(poolId, withEnded).then(({ count, version, endedCount }) => {
      setFarmCount(count);
      setFarmVersion(version);
      setEndedFarmCount(endedCount);
    });
  }, [poolId]);

  return { farmCount, farmVersion, endedFarmCount };
};

export const useCanFarmV2 = (poolId: number, withEnded?: boolean) => {
  const [farmCount, setFarmCount] = useState<number>(0);

  const [endedFarmCount, setEndedFarmCount] = useState<number>(0);

  const [farmVersion, setFarmVersion] = useState<string>("");

  useEffect(() => {
    canFarmV2(poolId, withEnded).then(({ count, version, endedCount }) => {
      setFarmCount(count);
      setFarmVersion(version);
      setEndedFarmCount(endedCount);
    });
  }, [poolId]);

  return { farmCount, farmVersion, endedFarmCount };
};

export const useYourliquidity = (poolId: number) => {
  const { pool, shares, stakeList, v2StakeList, finalStakeList } =
    usePool(poolId);

  const farmStakeV1 = useFarmStake({ poolId, stakeList });
  const farmStakeV2 = useFarmStake({ poolId, stakeList: v2StakeList });

  const farmStakeTotal = useFarmStake({ poolId, stakeList: finalStakeList });

  const userTotalShare = BigNumber.sum(shares, farmStakeTotal);

  const userTotalShareToString = userTotalShare
    .toNumber()
    .toLocaleString("fullwide", { useGrouping: false });

  return {
    pool,
    shares,
    stakeList,
    v2StakeList,
    finalStakeList,
    farmStakeTotal,
    farmStakeV1,
    farmStakeV2,
    userTotalShare,
    userTotalShareToString,
  };
};
