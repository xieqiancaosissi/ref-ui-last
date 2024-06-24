import { TokenMetadata } from "@/services/ft-contract";
export interface PoolRPCView {
  id: number;
  token_account_ids: string[];
  amounts: string[];
  total_fee: number;
  shares_total_supply: string;
  pool_kind: string;
  update_time?: number;
  token_symbols?: string[];
  tvl?: string;
}

export interface Pool {
  id: number;
  tokenIds: string[];
  supplies: { [key: string]: string };
  shareSupply: string;
  fee: number;
  pool_kind: string;
  tvl?: string;
  partialAmountIn?: string;
  rates?: {
    [id: string]: string;
  };
  Dex?: string;
  pairAdd?: string;
}

export interface IPoolsByTokens {
  id: number;
  token1Id: string;
  token2Id: string;
  token1Supply: string;
  token2Supply: string;
  fee: number;
  shares: string;
  update_time: number;
  pool_kind: string;
  Dex?: string;
  pairAdd?: string;
  tvl?: string;
}
export interface StablePool {
  id: number;
  token_account_ids: string[];
  decimals: number[];
  amounts: string[];
  c_amounts: string[];
  total_fee: number;
  shares_total_supply: string;
  amp: number;
  rates: string[];
  update_time?: number;
}
export interface ReservesMap {
  [index: string]: string;
}
export type SwapContractType =
  | "Ref_Classic"
  | "Ref_DCL"
  | "Orderly"
  | "Trisolaris";
export enum PoolMode {
  PARALLEL = "parallel swap",
  SMART = "smart routing",
  SMART_V2 = "stableSmart",
  STABLE = "stable swap",
}
export enum SWAP_MODE {
  NORMAL = "normal",
  LIMIT = "limit",
}
export interface RoutePool {
  amounts: string[];
  fee: number;
  id: number;
  reserves: ReservesMap;
  shares: string;
  token0_ref_price: string;
  token1Id: string;
  token1Supply: string;
  token2Id: string;
  token2Supply: string;
  updateTime: number;
  partialAmountIn?: string | number | Big;
  gamma_bps?: Big;
  supplies?: ReservesMap;
  tokenIds?: string[];
  x?: string;
  y?: string;
}
export interface EstimateSwapView {
  estimate: string;
  pool: Pool | null;
  intl?: any;
  partialAmountIn?: string;
  dy?: string;
  status?: PoolMode;
  token?: TokenMetadata;
  noFeeAmountOut?: string;
  inputToken?: string;
  outputToken?: string;
  nodeRoute?: string[];
  tokens?: TokenMetadata[];
  routeInputToken?: string;
  routeOutputToken?: string;
  route?: RoutePool[];
  allRoutes?: RoutePool[][];
  allNodeRoutes?: string[][];
  totalInputAmount?: string;
  overallPriceImpact?: string;
  contract?: SwapContractType;
  percent?: string;
}
export interface EstimateSwapOptions {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
  supportLedger: boolean;
  supportLittlePools: boolean;
}

export interface EstimateSwapParams {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
  intl?: any;
  setLoadingData?: (loading: boolean) => void;
  loadingTrigger?: boolean;
  setLoadingTrigger?: (loadingTrigger: boolean) => void;
  swapMode?: SWAP_MODE;
  supportLedger?: boolean;
  swapPro?: boolean;
  setSwapsToDoTri?: (todos: EstimateSwapView[]) => void;
  setSwapsToDoRef?: (todos: EstimateSwapView[]) => void;
  proGetCachePool?: boolean;
}

export interface IEstimateResult {
  swapError?: Error | undefined;
  swapsToDo?: EstimateSwapView[] | undefined;
  quoteDone?: boolean;
  tag?: string;
}

export type SwapMarket = "ref" | "tri" | "orderly" | undefined;
