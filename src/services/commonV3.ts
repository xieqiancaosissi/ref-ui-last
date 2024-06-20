import BigNumber from "bignumber.js";
import { TokenMetadata } from "./ft-contract";
import { PoolInfo } from "./swapV3";
import getConfig from "../utils/config";
import { FarmBoost, Seed } from "./farm";
import { scientificNotationToString, toPrecision } from "../utils/numbers";
import { getTokens } from "./tokens_static";
import _ from "lodash";
import {
  CrossIconEmpty,
  CrossIconFull,
  CrossIconLarge,
  CrossIconLittle,
  CrossIconMiddle,
} from "@/components/farm/icon/FarmBoost";

const { REF_UNI_V3_SWAP_CONTRACT_ID, boostBlackList } = getConfig();

export const CONSTANT_D = 1.0001;

export interface UserLiquidityInfo {
  lpt_id?: string;
  owner_id?: string;
  pool_id: string;
  left_point: number;
  right_point: number;
  amount: string;
  unclaimed_fee_x?: string;
  unclaimed_fee_y?: string;
  mft_id?: string;
  v_liquidity?: string;
  part_farm_ratio?: string;
  unfarm_part_amount?: string;
  status_in_other_seed?: string;
  less_than_min_deposit?: boolean;
  farmList?: FarmBoost[];
}

export const TOKEN_LIST_FOR_RATE = [
  "USDC.e",
  "USDC",
  "USDT.e",
  "USDT",
  "DAI",
  "USDt",
];

export function openUrl(url: string) {
  const newTab = window.open();
  if (newTab) {
    newTab.opener = null;
    newTab.location = url;
  } else {
    console.log("无法打开新窗口");
  }
}

export function getXAmount_per_point_by_Lx(L: string, point: number) {
  const xAmount = new BigNumber(L)
    .dividedBy(Math.pow(Math.sqrt(CONSTANT_D), point))
    .toFixed();
  return xAmount;
}

export function getYAmount_per_point_by_Ly(L: string, point: number) {
  const yAmount = new BigNumber(L)
    .multipliedBy(Math.pow(Math.sqrt(CONSTANT_D), point))
    .toFixed();
  return yAmount;
}

function getY(
  leftPoint: number,
  rightPoint: number,
  L: string,
  token: TokenMetadata
) {
  const y = new BigNumber(L).multipliedBy(
    (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
      Math.pow(Math.sqrt(CONSTANT_D), leftPoint)) /
      (Math.sqrt(CONSTANT_D) - 1)
  );
  return y.shiftedBy(-token.decimals).toFixed();
}
function getX(
  leftPoint: number,
  rightPoint: number,
  L: string,
  token: TokenMetadata
) {
  const x = new BigNumber(L).multipliedBy(
    (Math.pow(Math.sqrt(CONSTANT_D), rightPoint - leftPoint) - 1) /
      (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
        Math.pow(Math.sqrt(CONSTANT_D), rightPoint - 1))
  );
  return x.shiftedBy(-token.decimals).toFixed();
}

function get_X_Y_In_CurrentPoint(
  tokenX: TokenMetadata,
  tokenY: TokenMetadata,
  L: string,
  poolDetail: PoolInfo
) {
  const { liquidity, liquidity_x, current_point } = poolDetail;

  const liquidityValue = liquidity ? liquidity : "0";
  const liquidityXValue = liquidity_x ? liquidity_x : "0";
  const currentPointValue = current_point !== undefined ? current_point : 0;

  const liquidity_y_big = new BigNumber(liquidityValue).minus(liquidityXValue);
  let Ly = "0";
  let Lx = "0";

  // only remove y
  if (liquidity_y_big.isGreaterThanOrEqualTo(L)) {
    Ly = L;
  } else {
    // have x and y
    Ly = liquidity_y_big.toFixed();
    Lx = new BigNumber(L).minus(Ly).toFixed();
  }

  const amountX = getXAmount_per_point_by_Lx(Lx, currentPointValue);
  const amountY = getYAmount_per_point_by_Ly(Ly, currentPointValue);

  const amountX_read = new BigNumber(amountX)
    .shiftedBy(-tokenX.decimals)
    .toFixed();
  const amountY_read = new BigNumber(amountY)
    .shiftedBy(-tokenY.decimals)
    .toFixed();

  return { amountx: amountX_read, amounty: amountY_read };
}

export function get_total_value_by_liquidity_amount_dcl({
  left_point,
  right_point,
  poolDetail,
  amount,
  price_x_y,
  metadata_x_y,
}: {
  left_point: number;
  right_point: number;
  poolDetail: PoolInfo;
  amount: string;
  price_x_y: Record<string, string>;
  metadata_x_y: Record<string, TokenMetadata>;
}) {
  const [tokenX, tokenY] = Object.values(metadata_x_y);
  const [priceX, priceY] = Object.values(price_x_y);
  if (poolDetail && typeof poolDetail.current_point !== "undefined") {
    const { current_point } = poolDetail;
    let total_x = "0";
    let total_y = "0";

    // in range
    if (current_point >= left_point && right_point > current_point) {
      const tokenYAmount = getY(left_point, current_point, amount, tokenY);
      const tokenXAmount = getX(current_point + 1, right_point, amount, tokenX);
      const { amountx, amounty } = get_X_Y_In_CurrentPoint(
        tokenX,
        tokenY,
        amount,
        poolDetail
      );
      total_x = new BigNumber(tokenXAmount).plus(amountx).toFixed();
      total_y = new BigNumber(tokenYAmount).plus(amounty).toFixed();
    }
    // only y token
    if (current_point >= right_point) {
      const tokenYAmount = getY(left_point, right_point, amount, tokenY);
      total_y = tokenYAmount;
    }
    // only x token
    if (left_point > current_point) {
      const tokenXAmount = getX(left_point, right_point, amount, tokenX);
      total_x = tokenXAmount;
    }
    const total_price_x = new BigNumber(total_x).multipliedBy(priceX);
    const total_price_y = new BigNumber(total_y).multipliedBy(priceY);
    return total_price_x.plus(total_price_y).toFixed();
  } else {
    console.error("Error: poolDetail or current_point is undefined");
    return "0";
  }
}

// processing of pool id and farm id
const FEE_TIER = [100, 400, 2000, 10000];
const TOKENS: any = getTokens();
function locate_fee(fee_tier: number) {
  for (let i = 0; i < FEE_TIER.length; i++) {
    if (FEE_TIER[i] == fee_tier) return i + 1;
  }
  return 0;
}
function locate_token_id(token_name: string) {
  const arr = Object.entries(TOKENS);
  for (let i = 0; i < arr.length; i++) {
    const [id, name] = arr[i];
    if (name == token_name) return id;
  }
  return "n/a";
}
export function get_pool_name(pool_id: string) {
  const parts = pool_id.split("|");
  const token_a = TOKENS[parts[0]];
  const token_b = TOKENS[parts[1]];
  const fee = parts[2];
  return `${token_a}<>${token_b}@${fee}`;
}
export function get_pool_id(pool_name: string) {
  const layer1_parts = pool_name.split("@");
  const layer2_parts = layer1_parts[0].split("<>");
  const token_a = locate_token_id(layer2_parts[0]);
  const token_b = locate_token_id(layer2_parts[1]);
  const fee = layer1_parts[1];
  return `${token_a}|${token_b}|${fee}`;
}
export function get_farm_name(farm_id: string) {
  const layer1_parts = farm_id.split("&");
  const pool_id = layer1_parts[1];
  const left_point = layer1_parts[2];
  const right_point = layer1_parts[3];
  const pool_name = get_pool_name(pool_id);
  return `F:${pool_name}[${left_point}-${right_point}]`;
}
export function get_farm_id(farm_name: string) {
  const layer0_parts = farm_name.split(":");
  let farm_type = "";
  if (layer0_parts[0] == "F") {
    farm_type = "FixRange";
  } else {
    farm_type = "N/A";
  }
  const layer1_parts = layer0_parts[1].split("[");
  const pool_id = get_pool_id(layer1_parts[0]);
  const layer2_parts = layer1_parts[1]
    .slice(0, layer1_parts[1].length - 1)
    .split("|");
  const lp = layer2_parts[0];
  const rp = layer2_parts[1];
  return `${REF_UNI_V3_SWAP_CONTRACT_ID}@{"FixRange":{"left_point":${lp},"right_point":${rp}}}&${pool_id}&${lp}&${rp}`;
}

export function isPending(seed: Seed) {
  let pending: boolean = true;
  const farms = seed.farmList || [];
  for (let i = 0; i < farms.length; i++) {
    if (farms[i].status != "Created" && farms[i].status != "Pending") {
      pending = false;
      break;
    }
  }
  return pending;
}
export function getLatestStartTime(seed: Seed) {
  let start_at: any[] = [];
  const farmList = seed.farmList;
  farmList?.forEach(function (item) {
    start_at.push(item.terms.start_at);
  });
  start_at = _.sortBy(start_at);
  // start_at = start_at.filter(function (val) {
  //   return +val != 0;
  // });
  if (+start_at[0] == 0) {
    return 0;
  } else {
    return start_at[start_at.length - 1];
  }
}
export function get_matched_seeds_for_dcl_pool({
  seeds,
  pool_id,
  sort,
}: {
  seeds: Seed[];
  pool_id: string;
  sort?: string;
}) {
  const activeSeeds = seeds.filter((seed: Seed) => {
    const { seed_id, farmList } = seed;
    const [contractId, mft_id] = seed_id.split("@");
    if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
      const [fixRange, pool_id_from_seed, left_point, right_point] =
        mft_id.split("&");
      if (farmList && farmList.length > 0) {
        return pool_id_from_seed == pool_id && farmList[0].status != "Ended";
      }
    }
    return false;
  });
  // sort by the latest
  activeSeeds.sort((b: Seed, a: Seed) => {
    const b_latest = getLatestStartTime(b);
    const a_latest = getLatestStartTime(a);
    if (b_latest == 0) return -1;
    if (a_latest == 0) return 1;
    return a_latest - b_latest;
  });
  if (sort != "new") {
    // having benefit
    const temp_seed = activeSeeds.find((s: Seed, index: number) => {
      if (!isPending(s)) {
        activeSeeds.splice(index, 1);
        return true;
      }
    });
    if (temp_seed) {
      activeSeeds.unshift(temp_seed);
    }
  }
  return activeSeeds;
}
export function getEffectiveFarmList(farmList: FarmBoost[]) {
  const farms: FarmBoost[] = JSON.parse(JSON.stringify(farmList || []));
  let allPending = true;
  for (let i = 0; i < farms.length; i++) {
    if (farms[i].status != "Created" && farms[i].status != "Pending") {
      allPending = false;
      break;
    }
  }
  const targetList = farms.filter((farm: FarmBoost) => {
    const pendingFarm = farm.status == "Created" || farm.status == "Pending";
    return allPending || !pendingFarm;
  });
  return targetList;
}

export const TOKEN_LIST_FOR_RATE_EXTRA = ["NEAR"];

export function sort_tokens_by_base(tokens: TokenMetadata[]) {
  const tokens_temp = JSON.parse(JSON.stringify(tokens || []));
  tokens_temp.sort((item2: TokenMetadata, item1: TokenMetadata) => {
    if (TOKEN_LIST_FOR_RATE_EXTRA.indexOf(item2.symbol) > -1) return 1;
    if (TOKEN_LIST_FOR_RATE_EXTRA.indexOf(item1.symbol) > -1) return -1;
    return 0;
  });
  tokens_temp.sort((item2: TokenMetadata, item1: TokenMetadata) => {
    if (TOKEN_LIST_FOR_RATE.indexOf(item2.symbol) > -1) return 1;
    if (TOKEN_LIST_FOR_RATE.indexOf(item1.symbol) > -1) return -1;
    return 0;
  });
  return tokens_temp;
}

/**
 * caculate price by point
 * @param pointDelta
 * @param point
 * @param decimalRate tokenX/tokenY
 * @returns
 */
export function getPriceByPoint(point: number, decimalRate: number) {
  const price = Math.pow(CONSTANT_D, point) * decimalRate;
  const price_handled = new BigNumber(price).toFixed();
  return price_handled;
}

export function displayNumberToAppropriateDecimals(num: string | number) {
  if (!num) return num;
  const numBig = new BigNumber(num);
  if (numBig.isEqualTo(0)) return 0;
  if (numBig.isLessThan(0.01)) {
    return toPrecision(scientificNotationToString(num.toString()), 5);
  } else if (numBig.isGreaterThanOrEqualTo(0.01) && numBig.isLessThan(1)) {
    return toPrecision(scientificNotationToString(num.toString()), 3);
  } else if (numBig.isGreaterThanOrEqualTo(1) && numBig.isLessThan(10000)) {
    return toPrecision(scientificNotationToString(num.toString()), 2);
  } else {
    return toPrecision(scientificNotationToString(num.toString()), 0);
  }
}

export function mint_liquidity(liquidity: UserLiquidityInfo, seed_id: string) {
  const { amount } = liquidity;
  const [left_point, right_point] = get_valid_range(liquidity, seed_id);
  if (+right_point > +left_point) {
    const temp_valid = +right_point - +left_point;
    const mint_amount = new BigNumber(Math.pow(temp_valid, 2))
      .multipliedBy(amount)
      .dividedBy(Math.pow(10, 6))
      .toFixed(0, 1);
    return mint_amount;
  }
  return "0";
}

export function get_valid_range(liquidity: UserLiquidityInfo, seed_id: string) {
  const { left_point, right_point } = liquidity;
  const [fixRange, dcl_pool_id, seed_left_point, seed_right_point] = seed_id
    .split("@")[1]
    .split("&");
  const max_left_point = Math.max(+left_point, +seed_left_point);
  const min_right_point = Math.min(+right_point, +seed_right_point);
  return [max_left_point, min_right_point];
}

export function get_intersection_radio({
  left_point_liquidity,
  right_point_liquidity,
  left_point_seed,
  right_point_seed,
}: {
  left_point_liquidity: string | number;
  right_point_liquidity: string | number;
  left_point_seed: string | number;
  right_point_seed: string | number;
}) {
  let percent;
  const max_left_point = Math.max(+left_point_liquidity, +left_point_seed);
  const min_right_point = Math.min(+right_point_liquidity, +right_point_seed);
  if (min_right_point > max_left_point) {
    const range_cross = new BigNumber(min_right_point).minus(max_left_point);
    const range_seed = new BigNumber(right_point_seed).minus(left_point_seed);
    const range_user = new BigNumber(right_point_liquidity).minus(
      left_point_liquidity
    );
    let range_denominator = range_seed;
    if (
      left_point_liquidity <= left_point_seed &&
      right_point_liquidity >= right_point_seed
    ) {
      range_denominator = range_user;
    }
    percent = range_cross
      .dividedBy(range_denominator)
      .multipliedBy(100)
      .toFixed();
  } else {
    percent = "0";
  }
  return percent;
}

export function get_intersection_icon_by_radio(radio: string): any {
  const p = new BigNumber(radio || "0");
  let icon;
  if (p.isEqualTo(0)) {
    icon = CrossIconEmpty;
  } else if (p.isLessThan(20)) {
    icon = CrossIconLittle;
  } else if (p.isLessThan(60)) {
    icon = CrossIconMiddle;
  } else if (p.isLessThan(100)) {
    icon = CrossIconLarge;
  } else {
    icon = CrossIconFull;
  }
  return icon;
}
