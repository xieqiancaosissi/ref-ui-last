import { TokenMetadata } from "@/services/ft-contract";

export interface IPoolDcl {
  pool_id: string;
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
  update_time?: number;
}

export interface EstimateDclSwapOptions {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
}
export interface EstimateDclSwapView {
  amount: string;
  tag: string;
}

export type IEstimateDclSwapView = EstimateDclSwapView | null;

export interface IEstimateResult {
  dclSwapError?: Error | undefined;
  dclSwapsToDo?: IEstimateDclSwapView | undefined;
  dclQuoteDone?: boolean;
  dclTag?: string;
}
