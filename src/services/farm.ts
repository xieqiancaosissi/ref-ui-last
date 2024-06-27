import getConfig from "@/utils/config";
import db, { BoostSeeds, TokenPrice } from "../db/RefDatabase";
import {
  REF_FARM_BOOST_CONTRACT_ID,
  REF_FI_CONTRACT_ID,
  RefFiFunctionCallOptions,
  refFarmBoostFunctionCall,
  refFiViewFunction,
} from "../utils/contract";
import { viewFunction } from "../utils/near";
import { executeFarmMultipleTransactions } from "../utils/contract";
import { getAccountId, getCurrentWallet } from "../utils/wallet";
import { TokenMetadata, ftGetStorageBalance } from "./ft-contract";
import { getPoolsByIds, getTokenPriceList } from "./indexer";
import { getDclPools } from "../services/swap/swapDcl";
import { IPoolDcl } from "../interfaces/swapDcl";
import {
  STORAGE_TO_REGISTER_WITH_MFT,
  storageDepositAction,
} from "./creator/storage";
import { nearMetadata, nearWithdrawTransaction } from "./wrap-near";
import {
  toInternationalCurrencySystem,
  toReadableNumber,
} from "../utils/numbers";
import BigNumber from "bignumber.js";

const config = getConfig();
const {
  REF_VE_CONTRACT_ID,
  REF_UNI_V3_SWAP_CONTRACT_ID,
  WRAP_NEAR_CONTRACT_ID,
} = config;
export const DEFAULT_PAGE_LIMIT = 300;
const STABLE_POOL_ID = getConfig().STABLE_POOL_ID;
const STABLE_POOL_IDS = getConfig().STABLE_POOL_IDS;
const STABLE_POOL_USN_ID = getConfig().STABLE_POOL_USN_ID;
const expand = 6;

export const classificationOfCoins_key = [
  "stablecoin",
  "near_ecosystem",
  "bridged_tokens",
  "gaming",
  "nft",
];
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
  pool?: PoolRPCView & IPoolDcl;
  seedTvl?: string;
  hidden?: boolean;
  endedFarmsIsSplit?: boolean;
  base?: number;
  token_meta_data?: TokenMetadata;
  farmer_count: number;
}
export interface BoostConfig {
  affected_seeds: Record<string, number>;
  booster_decimal: number;
}

export interface UserSeedInfo {
  boost_ratios: any;
  duration_sec: number;
  free_amount: string;
  locked_amount: string;
  unlock_timestamp: string;
  x_locked_amount: string;
}
interface FrontConfigBoost {
  [key: string]: string | number | undefined;
}

export interface Transaction {
  receiverId: string;
  functionCalls: RefFiFunctionCallOptions[];
}

export interface MonthData {
  text: string;
  m: number;
  day: number;
  second: number;
  rate?: number;
}

export const frontConfigBoost: FrontConfigBoost = {
  "4514": 102,
  "4179": 101,
  "79": "100",
  "3": "99",
  "4": "98",
  "phoenix-bonds.near|wrap.near|2000": "97",
};

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

export const getAllTokenPrices = async (): Promise<
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

export function getFarmClassification(): any {
  const env: string = process.env.REACT_APP_NEAR_ENV || "";
  if (env == "pub-testnet") {
    return {
      near: [
        "usdt.fakes.testnet|wrap.testnet|2000",
        "usdt.fakes.testnet|wrap.testnet|100",
        "465",
      ],
      eth: ["phoenix-bonds.testnet|wrap.testnet|2000", "604"],
      stable: ["79"],
      meme: [],
    };
  } else if (env == "testnet") {
    return {
      near: [
        "usdt.fakes.testnet|wrap.testnet|2000",
        "usdt.fakes.testnet|wrap.testnet|100",
        "465",
      ],
      eth: ["phoenix-bonds.testnet|wrap.testnet|2000", "604"],
      stable: ["79"],
      meme: [],
    };
  } else {
    return {
      near: [
        "0",
        "1207",
        "1371",
        "1395",
        "2330",
        "2448",
        "2799",
        "3",
        "3019",
        "3097",
        "3474",
        "3514",
        "3515",
        "3519",
        "377",
        "4",
        "974",
        "1195",
        "1923",
        "3448",
        "553",
        "79",
        "2691",
        "2800",
        "3020",
        "3433",
        "3612",
        "2769",
        "2973",
        "3667",
        "3688",
        "3699",
        "3714",
        "3471",
        "3449",
        "3819",
        "3804",
        "3815",
        "phoenix-bonds.near|wrap.near|2000",
        "4276",
        "4314",
        "3807",
        "4276",
        "4369",
        "4514",
        "4771",
        "4479",
        "4820",
      ],
      eth: [
        "605",
        "1207",
        "2734",
        "1395",
        "1910",
        "2330",
        "2657",
        "2691",
        "2799",
        "2800",
        "3",
        "3020",
        "3433",
        "4",
        "974",
        "3097",
        "3636",
        "3815",
        "3804",
        "3471",
        "4479",
      ],
      stable: [
        "1910",
        "3020",
        "3433",
        "3514",
        "3515",
        "3688",
        "3689",
        "3699",
        "4179",
        "4514",
      ],
      meme: ["4314", "3807", "4276", "4369", "4771", "4820"],
    };
  }
}

export const list_seeds_info = async () => {
  return await refFarmBoostViewFunction({
    methodName: "list_seeds_info",
  });
};

export const getBoostSeeds = async (): Promise<{
  seeds: Seed[];
  farms: FarmBoost[][];
  pools: PoolRPCView[] & IPoolDcl[];
}> => {
  try {
    const seeds: Seed[] = [];
    const farms: FarmBoost[][] = [];
    const pools: PoolRPCView[] & IPoolDcl[] = [];
    const cacheData = await db.checkBoostSeeds();
    if (cacheData) {
      const list: BoostSeeds[] = await db.queryBoostSeeds();
      list.forEach((s: BoostSeeds) => {
        const { id, update_time, ...info } = s;
        const { seed, farmList, pool } = info as any;
        seeds.push(seed);
        farms.push(farmList);
        if (pool) {
          pools.push(pool);
        }
      });
      getBoostSeedsFromServer();
      return { seeds, farms, pools };
    } else {
      const result = await getBoostSeedsFromServer();
      return result;
    }
  } catch (error) {
    return { seeds: [], farms: [], pools: [] };
  }
};
export const list_seed_farms = async (seed_id: string) => {
  try {
    return await refFarmBoostViewFunction({
      methodName: "list_seed_farms",
      args: { seed_id },
    });
  } catch {
    return null;
  }
};
export const getBoostSeedsFromServer = async (): Promise<{
  seeds: Seed[];
  farms: FarmBoost[][];
  pools: PoolRPCView[] & IPoolDcl[];
}> => {
  try {
    // get all seeds
    let list_seeds = await list_seeds_info();
    // not the classic and dcl seeds would be filtered
    list_seeds = list_seeds.filter((seed: Seed) => {
      const contract_id = seed.seed_id.split("@")?.[0];
      return (
        contract_id == REF_UNI_V3_SWAP_CONTRACT_ID ||
        contract_id == REF_FI_CONTRACT_ID
      );
    });
    // get all farms
    const farmsPromiseList: Promise<any>[] = [];
    const poolIds = new Set<string>();
    const dcl_poolIds = new Set<string>();
    // get all dcl pools
    const dcl_all_pools: IPoolDcl[] = await getDclPools();
    let pools: any[] = [];
    const both_normalPools_dclPools: any[] = [];
    list_seeds.forEach((seed: Seed) => {
      const { seed_id } = seed;
      // seed type: [commonSeed, loveSeed, dclSeed]
      const [contractId, tempPoolId] = seed_id.split("@");
      if (tempPoolId && contractId !== REF_UNI_V3_SWAP_CONTRACT_ID) {
        poolIds.add(tempPoolId);
      } else if (tempPoolId && contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
        const [fixRange, dcl_pool_id, left_point, right_point] =
          tempPoolId.split("&");
        dcl_poolIds.add(dcl_pool_id);
      }
      farmsPromiseList.push(list_seed_farms(seed_id));
    });
    const list_farms: FarmBoost[][] = await Promise.all(farmsPromiseList);
    let cacheFarms: FarmBoost[] = [];
    list_farms.forEach((arr: FarmBoost[]) => {
      cacheFarms = cacheFarms.concat(arr);
    });
    pools = await getPoolsByIds({ pool_ids: Array.from(poolIds) });
    // cache seeds farms pools
    const cacheSeedsFarmsPools: any[] = [];
    list_seeds.forEach((seed: Seed, index: number) => {
      let pool: any = null;
      const [contractId, tempPoolId] = seed.seed_id.split("@");
      if (tempPoolId) {
        if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
          const [fixRange, dcl_pool_id, left_point, right_point] =
            tempPoolId.split("&");
          pool = dcl_all_pools.find((p: IPoolDcl) => {
            if (p.pool_id == dcl_pool_id) return true;
          });
        } else {
          const id = tempPoolId;
          pool = pools.find((p: any) => {
            if (+p.id == +id) return true;
          });
        }
      }
      cacheSeedsFarmsPools.push({
        id: seed.seed_id,
        seed,
        farmList: list_farms[index],
        pool,
      });
      if (pool) {
        both_normalPools_dclPools.push(pool);
      }
    });
    db.cacheBoostSeeds(cacheSeedsFarmsPools);
    return {
      seeds: list_seeds,
      farms: list_farms,
      pools: both_normalPools_dclPools,
    };
  } catch (error) {
    return {
      seeds: [],
      farms: [],
      pools: [],
    };
  }
};

export const list_farmer_seeds = async () => {
  const accountId = getAccountId();
  return await refFarmBoostViewFunction({
    methodName: "list_farmer_seeds",
    args: { farmer_id: accountId },
  });
};

export const get_unclaimed_rewards = async (seed_id: string) => {
  const accountId = getAccountId();
  return await refFarmBoostViewFunction({
    methodName: "get_unclaimed_rewards",
    args: { farmer_id: accountId, seed_id },
  });
};

export const getVeSeedShare = async (): Promise<any> => {
  // REF_VE_CONTRACT_ID
  return await fetch(
    config.sodakiApiUrl + `/seed/v2.ref-finance.near@79/accounts`,
    {
      method: "GET",
    }
  )
    .then((res) => res.json())
    .then((res) => {
      return res;
    })
    .catch(() => {
      return {};
    });
};

export const get_config = async () => {
  return await refFarmBoostViewFunction({
    methodName: "get_config",
  });
};

export const claimRewardBySeed_boost = async (
  seed_id: string
): Promise<any> => {
  return refFarmBoostFunctionCall({
    methodName: "claim_reward_by_seed",
    args: { seed_id },
  });
};

export const getPoolIdBySeedId = (seed_id: string) => {
  const [contractId, temp_pool_id] = seed_id.split("@");
  if (temp_pool_id) {
    if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
      const [fixRange, dcl_pool_id, left_point, right_point] =
        temp_pool_id.split("&");
      return dcl_pool_id;
    } else {
      return temp_pool_id;
    }
  }
  return "";
};

export const toRealSymbol = (symbol: string) => {
  if (!symbol) return "";
  const blackList = ["nUSDO", "nKOK"];

  if (!symbol) return symbol;

  if (symbol === "nWETH" || symbol === "WETH") return "wETH";
  if (blackList.includes(symbol)) return symbol;
  return symbol?.charAt(0) === "n" &&
    symbol.charAt(1) === symbol.charAt(1).toUpperCase()
    ? symbol.substring(1)
    : symbol;
};

export const getMftTokenId = (id: string) => {
  return ":" + id;
};

export const withdrawAllReward_boost = async (
  checkedList: Record<string, any>
) => {
  const transactions: Transaction[] = [];
  const token_id_list = Object.keys(checkedList);
  const ftBalancePromiseList: any[] = [];
  const functionCalls: any[] = [];

  token_id_list.forEach((token_id) => {
    const ftBalance = ftGetStorageBalance(token_id);
    ftBalancePromiseList.push(ftBalance);
    functionCalls.push({
      methodName: "withdraw_reward",
      args: {
        token_id,
      },
      gas: "50000000000000",
    });
  });
  const resolvedBalanceList = await Promise.all(ftBalancePromiseList);
  resolvedBalanceList.forEach((ftBalance, index) => {
    if (!ftBalance) {
      transactions.unshift({
        receiverId: token_id_list[index],
        functionCalls: [
          storageDepositAction({
            registrationOnly: true,
            amount: STORAGE_TO_REGISTER_WITH_MFT,
          }),
        ],
      });
    }
  });

  transactions.push({
    receiverId: REF_FARM_BOOST_CONTRACT_ID,
    functionCalls,
  });
  if (Object.keys(checkedList).includes(WRAP_NEAR_CONTRACT_ID)) {
    sessionStorage.setItem("near_with_draw_source", "farm_token");
    transactions.push(
      nearWithdrawTransaction(
        toReadableNumber(
          nearMetadata.decimals,
          checkedList[WRAP_NEAR_CONTRACT_ID].value
        )
      )
    );
  }
  return executeFarmMultipleTransactions(transactions);
};

export const mftGetBalance = async (token_id: string) => {
  const accountId = getAccountId();
  return await refFiViewFunction({
    methodName: "mft_balance_of",
    args: { account_id: accountId, token_id },
  });
};

export const handleNumber = (number: string) => {
  const temp = toInternationalCurrencySystem(number, 3);
  const length = temp.length;
  const left = temp.substring(0, length - 1);
  const right = temp.substring(length - 1);
  let result = temp;
  if (["K", "M", "B"].indexOf(right) > -1) {
    result = new BigNumber(left).toFixed() + right;
  }
  return result;
};
