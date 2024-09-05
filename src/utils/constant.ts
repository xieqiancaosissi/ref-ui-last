import BN from "bn.js";
export const MIN_RETAINED_NEAR_AMOUNT = 0.2;
export const POOL_REFRESH_INTERVAL = 20 * 1000;
export const INIT_SLIPPAGE_VALUE = "0.5";
export const DEFAULT_PAGE_LIMIT = 500;
export const TOP_POOLS_TOKEN_REFRESH_INTERVAL = 60 * 2;
export const FEE_DIVISOR = 10000;
export const STABLE_LP_TOKEN_DECIMALS = 18;
export const RATED_POOL_LP_TOKEN_DECIMALS = 24;
export const V3_POOL_FEE_LIST = [100, 400, 2000, 10000];
export const LOW_POOL_TVL_BOUND = 3;
export const PRICE_IMPACT_WARN_VALUE = 1;
export const PRICE_IMPACT_RED_VALUE = 2;
export const STORAGE_PER_TOKEN = "0.005";
export const STORAGE_TO_REGISTER_WITH_FT = "0.1";
export const STORAGE_TO_REGISTER_WITH_MFT = "0.1";
export const MIN_DEPOSIT_PER_TOKEN = new BN("5000000000000000000000");
export const MIN_DEPOSIT_PER_TOKEN_FARM = new BN("45000000000000000000000");
export const ONE_MORE_DEPOSIT_AMOUNT = "0.01";
export const LOG_BASE = 1.0001;
export const V3_POOL_SPLITER = "|";
export const POINTLEFTRANGE = -800000;
export const POINTRIGHTRANGE = 800000;
export const TIMESTAMP_DIVISOR = 1000000000;
export const TKN_SUFFIX = "tkn";
export const TKNX_SUFFIX = "tknx";
export const MC_SUFFIX = "meme-cooking";
