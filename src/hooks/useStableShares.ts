import React, { useState, useEffect } from "react";
import { canFarmV1, canFarmV2 } from "@/services/pool_detail";
import { usePool } from "./usePools";
import BigNumber from "bignumber.js";
import { getStablePoolDecimal } from "@/services/swap/swapUtils";
import {
  toReadableNumber,
  toNonDivisibleNumber,
  scientificNotationToString,
  toPrecision,
} from "@/utils/numbers";
import Big from "big.js";
import _ from "lodash";

const FEE_DIVISOR = 10000;
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

export const getAddLiquidityShares = async (
  pool_id: number,
  amounts: string[],
  stablePool: any
) => {
  const amp = stablePool.amp;
  const trade_fee = stablePool.total_fee * 10000;

  const STABLE_LP_TOKEN_DECIMALS = getStablePoolDecimal(pool_id);
  const base_old_c_amounts = stablePool.c_amounts.map((amount: any) =>
    toReadableNumber(STABLE_LP_TOKEN_DECIMALS, amount)
  );
  console.log(STABLE_LP_TOKEN_DECIMALS);
  console.log(base_old_c_amounts, stablePool.c_amounts);
  const rates = Reflect.has(stablePool, "degens")
    ? stablePool.degens.map((r: any) =>
        toReadableNumber(STABLE_LP_TOKEN_DECIMALS, r)
      )
    : stablePool.rates.map((r: any) =>
        toReadableNumber(STABLE_LP_TOKEN_DECIMALS, r)
      );
  const old_c_amounts = base_old_c_amounts
    .map((amount: any, i: number) =>
      toNonDivisibleNumber(
        STABLE_LP_TOKEN_DECIMALS,
        scientificNotationToString(
          new Big(amount).times(new Big(rates[i])).toString()
        )
      )
    )
    .map((amount: any) => Number(amount));

  const deposit_c_amounts = amounts
    .map((amount, i) =>
      toNonDivisibleNumber(
        STABLE_LP_TOKEN_DECIMALS,
        scientificNotationToString(
          new Big(amount).times(new Big(rates[i])).toString()
        )
      )
    )
    .map((amount) => Number(amount));

  // const deposit_c_amounts = amounts.map((amount) =>
  //   Number(toNonDivisibleNumber(STABLE_LP_TOKEN_DECIMALS, amount))
  // );

  // const old_c_amounts = stablePool.c_amounts.map((amount) => Number(amount));

  const pool_token_supply = Number(stablePool.shares_total_supply);

  const [min_shares, fee_ratio] = calc_add_liquidity(
    amp,
    deposit_c_amounts,
    old_c_amounts,
    pool_token_supply,
    trade_fee
  );
  console.log(
    amp,
    deposit_c_amounts,
    old_c_amounts,
    pool_token_supply,
    trade_fee
  );

  return toPrecision(scientificNotationToString(min_shares.toString()), 0);
};

export const calc_add_liquidity = (
  amp: number,
  deposit_c_amounts: number[],
  old_c_amounts: number[],
  pool_token_supply: number,
  trade_fee: number
) => {
  if (pool_token_supply === 0) {
    const d_0 = calc_d(amp, deposit_c_amounts);
    return [d_0, 0];
  }

  const token_num = old_c_amounts.length;
  const d_0 = calc_d(amp, old_c_amounts);
  const c_amounts = [];
  for (let i = 0; i < old_c_amounts.length; i++) {
    c_amounts[i] = old_c_amounts[i] + deposit_c_amounts[i];
  }
  const d_1 = calc_d(amp, c_amounts);

  if (Number(d_1) <= Number(d_0))
    throw new Error(`D1 need less then or equal to D0.`);

  for (let i = 0; i < token_num; i++) {
    const ideal_balance = (old_c_amounts[i] * d_1) / d_0;
    const difference = Math.abs(ideal_balance - c_amounts[i]);
    const fee = normalized_trade_fee(token_num, difference, trade_fee);
    c_amounts[i] -= fee;
  }
  const d_2 = calc_d(amp, c_amounts);

  if (Number(d_1) < Number(d_2)) throw new Error(`D2 need less then D1.`);

  if (Number(d_2) <= Number(d_0))
    throw new Error(`D1 need less then or equal to D0.`);
  const mint_shares = (pool_token_supply * (d_2 - d_0)) / d_0;
  const diff_shares = (pool_token_supply * (d_1 - d_0)) / d_0;

  return [mint_shares, diff_shares - mint_shares];
};

const normalized_trade_fee = (
  token_num: number,
  amount: number,
  trade_fee: number
) => {
  const adjusted_trade_fee = Number(
    Math.floor((trade_fee * token_num) / (4 * (token_num - 1)))
  );
  return (amount * adjusted_trade_fee) / FEE_DIVISOR;
};

export const calc_d = (amp: number, c_amounts: number[]) => {
  const token_num = c_amounts.length;
  const sum_amounts = _.sum(c_amounts);
  let d_prev = 0;
  let d = sum_amounts;
  for (let i = 0; i < 256; i++) {
    let d_prod = d;
    for (const c_amount of c_amounts) {
      d_prod = (d_prod * d) / (c_amount * token_num);
    }
    d_prev = d;
    const ann = amp * token_num ** token_num;
    const numerator = d_prev * (d_prod * token_num + ann * sum_amounts);
    const denominator = d_prev * (ann - 1) + d_prod * (token_num + 1);
    d = numerator / denominator;
    if (Math.abs(d - d_prev) <= 1) break;
  }
  return d;
};

export const calc_y = (
  amp: number,
  x_c_amount: number,
  current_c_amounts: number[],
  index_x: number,
  index_y: number
) => {
  const token_num = current_c_amounts.length;
  const ann = amp * token_num ** token_num;
  const d = calc_d(amp, current_c_amounts);
  let s = x_c_amount;
  let c = (d * d) / x_c_amount;
  for (let i = 0; i < token_num; i++) {
    if (i != index_x && i != index_y) {
      s += current_c_amounts[i];
      c = (c * d) / current_c_amounts[i];
    }
  }
  c = (c * d) / (ann * token_num ** token_num);
  const b = d / ann + s;
  let y_prev = 0;
  let y = d;
  for (let i = 0; i < 256; i++) {
    y_prev = y;
    const y_numerator = y ** 2 + c;
    const y_denominator = 2 * y + b - d;
    y = y_numerator / y_denominator;
    if (Math.abs(y - y_prev) <= 1) break;
  }

  return y;
};
