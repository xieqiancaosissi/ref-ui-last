import moment from "moment";
import Big from "big.js";
import _ from "lodash";
import { PoolRPCView, Pool, IPoolsByTokens } from "@/interfaces/swap";
import { TokenMetadata } from "@/services/ft-contract";
import { toReadableNumber } from "@/utils/numbers";
import { ALL_STABLE_POOL_IDS, AllStableTokenIds } from "./swapConfig";
import getStablePoolConfig from "@/utils/getStablePoolConfig";
import { StablePool } from "@/interfaces/swap";
import {
  STABLE_LP_TOKEN_DECIMALS,
  RATED_POOL_LP_TOKEN_DECIMALS,
} from "@/utils/constant";
import db from "@/db/RefDatabase";
const { RATED_POOLS_IDS } = getStablePoolConfig();
export const parsePool = (pool: PoolRPCView, id: number): Pool => ({
  id: Number(id >= 0 ? id : pool.id),
  tokenIds: pool.token_account_ids,
  supplies: pool.amounts.reduce(
    (acc: { [tokenId: string]: string }, amount: string, i: number) => {
      acc[pool.token_account_ids[i]] = amount;
      return acc;
    },
    {}
  ),
  shareSupply: pool.shares_total_supply,
  fee: pool.total_fee,
  pool_kind: pool.pool_kind,
  tvl: pool?.tvl,
});
export const parsePools = (pools: PoolRPCView[]): Pool[] => {
  const parsedPools = pools.map((p: PoolRPCView) => {
    return {
      ...parsePool(p, p.id),
      Dex: "ref",
    };
  });
  return parsedPools;
};
export const parsePoolsByTokens = (pools: Pool[]): IPoolsByTokens[] => {
  const poolsByTokens = pools.map((pool: Pool) => ({
    id: pool.id,
    token1Id: pool.tokenIds[0],
    token2Id: pool.tokenIds[1],
    token1Supply: pool.supplies[pool.tokenIds[0]],
    token2Supply: pool.supplies[pool.tokenIds[1]],
    fee: pool.fee,
    shares: pool.shareSupply,
    pool_kind: pool.pool_kind,
    update_time: moment().unix(),
    Dex: pool.Dex,
    pairAdd: pool.pairAdd,
    tvl: pool.tvl,
  }));
  return poolsByTokens;
};
export const parsePoolsByTokensToPool = (pools: IPoolsByTokens[]): Pool[] => {
  const parsedPools = pools.map((item: IPoolsByTokens) => ({
    id: item.id,
    tokenIds: [item.token1Id, item.token2Id],
    supplies: {
      [item.token1Id]: item.token1Supply,
      [item.token2Id]: item.token2Supply,
    },
    shareSupply: item.shares,
    fee: item.fee,
    Dex: item.Dex,
    pairAdd: item.pairAdd,
    pool_kind: item.pool_kind,
  }));
  return parsedPools;
};
export const getLiquidity = (
  pool: Pool,
  tokenIn: TokenMetadata,
  tokenOut: TokenMetadata
) => {
  const amount1 = toReadableNumber(tokenIn.decimals, pool.supplies[tokenIn.id]);
  const amount2 = toReadableNumber(
    tokenOut.decimals,
    pool.supplies[tokenOut.id]
  );

  const lp = new Big(amount1).times(new Big(amount2));

  return Number(lp);
};
export const getStablePoolThisPair = ({
  tokenInId,
  tokenOutId,
  stablePools,
}: {
  tokenInId: string;
  tokenOutId: string;
  stablePools: Pool[];
}) => {
  return stablePools.filter(
    (p) =>
      p.tokenIds.includes(tokenInId) &&
      p.tokenIds.includes(tokenOutId) &&
      tokenInId !== tokenOutId
  );
};
export const isNotStablePool = (pool: Pool) => {
  return !isStablePool(pool.id);
};
export const isStablePool = (id: string | number) => {
  return ALL_STABLE_POOL_IDS.map((id) => id.toString()).includes(id.toString());
};
export const isRatedPool = (id: string | number) => {
  return RATED_POOLS_IDS.includes(id.toString());
};
export const isStableToken = (id: string) => {
  return AllStableTokenIds.includes(id);
};
export const getStablePoolDecimal = (id: string | number) => {
  if (isRatedPool(id)) return RATED_POOL_LP_TOKEN_DECIMALS;
  // else if (isStablePool(id)) return STABLE_LP_TOKEN_DECIMALS;
  else return STABLE_LP_TOKEN_DECIMALS;
};
export const getRefPoolsByTokens = async () => {
  return await db.queryPoolsByTokens2();
};
export const getStablePoolInfoThisPair = ({
  tokenInId,
  tokenOutId,
  stablePoolsInfo,
}: {
  tokenInId: string;
  tokenOutId: string;
  stablePoolsInfo: StablePool[];
}) => {
  return stablePoolsInfo.filter(
    (p) =>
      p.token_account_ids.includes(tokenInId) &&
      p.token_account_ids.includes(tokenOutId)
  );
};
