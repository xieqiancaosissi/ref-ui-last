import getConfig from "@/utils/config";
import db, { BoostSeeds, TokenPrice } from "../db/RefDatabase";
import { REF_FARM_BOOST_CONTRACT_ID, viewFunction } from "../utils/near";
import { getAccountId } from "../utils/wallet";
import { TokenMetadata } from "./ft-contract";
import { getTokenPriceList } from "./indexer";

const config = getConfig();
export interface PoolInfo {
  pool_id?: string;
  token_x?: string;
  token_y?: string;
  fee: number;
  point_delta?: number;
  current_point?: number;
  state?: string; // running or paused
  total_liquidity?: string;
  liquidity?: string;
  liquidity_x?: string;
  max_liquidity_per_point?: string;
  percent?: string;
  total_x?: string;
  total_y?: string;
  tvl?: number;
  token_x_metadata?: TokenMetadata;
  token_y_metadata?: TokenMetadata;
  total_fee_x_charged?: string;
  total_fee_y_charged?: string;
  top_bin_apr?: string;
  top_bin_apr_display?: string;
  tvlUnreal?: boolean;
}

export interface PoolRPCView {
  id: number;
  token_account_ids: string[];
  token_symbols: string[];
  amounts: string[];
  pool_kind?: string;
  total_fee: number;
  shares_total_supply: string;
  tvl: number;
  token0_ref_price: string;
  share: string;
  decimalsHandled?: boolean;
  tokens_meta_data?: TokenMetadata[];
  h24volume?: string;
  apr?: number;
  baseApr?: string;
}
export interface FarmBoostTerm {
  daily_reward: string;
  reward_token: string;
  start_at: number;
}
export interface FarmBoost {
  amount_of_beneficiary: string;
  claimed_reward: string;
  distributed_at: string;
  distributed_reward: string;
  farm_id: string;
  status: string;
  terms: FarmBoostTerm;
  total_reward: string;
  token_meta_data?: TokenMetadata;
  apr?: string;
  baseApr?: string;
  yourNFTApr?: string;
}

export interface Seed {
  min_deposit: string;
  min_locking_duration_sec: number;
  next_index: number;
  seed_decimal: number;
  seed_id: string;
  slash_rate: number;
  total_seed_amount: string;
  total_seed_power: string;
  farmList?: FarmBoost[];
  pool?: PoolRPCView & PoolInfo;
  seedTvl?: string;
  hidden?: boolean;
  endedFarmsIsSplit?: boolean;
  base?: number;
  token_meta_data?: TokenMetadata;
  farmer_count: number;
}
export async function refFarmBoostViewFunction({
  methodName,
  args,
}: {
  contractId?: string;
  methodName: string;
  args?: object;
}) {
  return viewFunction({
    contractId: REF_FARM_BOOST_CONTRACT_ID,
    methodName,
    args,
  });
}
export const get_unWithDraw_rewards = async () => {
  const accountId = getAccountId();
  return await refFarmBoostViewFunction({
    methodName: "list_farmer_rewards",
    args: { farmer_id: accountId },
  });
};

export const getBoostTokenPrices = async (): Promise<
  Record<string, TokenPrice>
> => {
  try {
    let tokenPrices: Record<string, TokenPrice> = {};
    const cacheData = await db.checkTokenPrices();
    if (cacheData) {
      const list: TokenPrice[] = await db.queryTokenPrices();
      list.forEach((price: TokenPrice) => {
        if (price.id) {
          const { id, update_time, ...priceInfo } = price;
          tokenPrices[id] = priceInfo;
        }
      });
      getBoostTokenPricesFromServer();
    } else {
      tokenPrices = await getBoostTokenPricesFromServer();
    }
    return tokenPrices;
  } catch (error) {
    return {};
  }
};

export const getBoostTokenPricesFromServer = async (): Promise<
  Record<string, TokenPrice>
> => {
  try {
    const tokenPrices: Record<string, TokenPrice> = await getTokenPriceList();
    await db.cacheTokenPrices(tokenPrices);
    return tokenPrices;
  } catch (error) {
    return {};
  }
};
