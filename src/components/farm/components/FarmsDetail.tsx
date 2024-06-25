import {
  Seed,
  BoostConfig,
  toRealSymbol,
  FarmBoost,
  getVeSeedShare,
} from "@/services/farm";
import { FarmDetailsPoolIcon } from "../icon";
import { TokenMetadata } from "@/services/ft-contract";
import { sort_tokens_by_base } from "@/services/commonV3";
import { useTokens } from "@/stores/token";
import { useRouter } from "next/router";
import { WRAP_NEAR_CONTRACT_ID } from "@/services/wrap-near";
import { NEAR_META_DATA } from "@/utils/nearMetaData";
import {
  toInternationalCurrencySystem,
  toPrecision,
  toReadableNumber,
} from "@/utils/numbers";
import { useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { LOVE_TOKEN_DECIMAL } from "@/services/referendum";
import getConfig from "@/utils/config";
import { get24hVolumes } from "@/services/indexer";

const ONLY_ZEROS = /^0*\.?0*$/;
const {
  STABLE_POOL_IDS,
  FARM_LOCK_SWITCH,
  REF_VE_CONTRACT_ID,
  FARM_BLACK_LIST_V2,
} = getConfig();
export default function FarmsDetail(props: {
  detailData: Seed;
  emptyDetailData: Function;
  tokenPriceList: any;
  loveSeed: Seed;
  boostConfig: BoostConfig;
  user_data: Record<string, any>;
  user_data_loading: Boolean;
  dayVolumeMap: Record<string, string>;
}) {
  const {
    detailData,
    emptyDetailData,
    tokenPriceList,
    loveSeed,
    boostConfig,
    user_data,
    user_data_loading,
    dayVolumeMap,
  } = props;
  const {
    user_seeds_map = {},
    user_unclaimed_map = {},
    user_unclaimed_token_meta_map = {},
  } = user_data;
  const pool = detailData.pool;
  const { token_account_ids } = pool || {};
  const tokens = sortTokens(useTokens(token_account_ids) || []);
  const router = useRouter();
  const [yourApr, setYourApr] = useState("");
  const [dayVolume, setDayVolume] = useState("");
  const [yourActualAprRate, setYourActualAprRate] = useState("1");
  const [maxLoveShareAmount, setMaxLoveShareAmount] = useState<string>("0");
  const aprUpLimit = getAprUpperLimit();
  function sortTokens(tokens: TokenMetadata[]) {
    tokens.sort((a: TokenMetadata, b: TokenMetadata) => {
      if (a.symbol === "NEAR") return 1;
      if (b.symbol === "NEAR") return -1;
      return 0;
    });
    return tokens;
  }
  useEffect(() => {
    const yourApr = getYourApr();
    if (yourApr) {
      setYourApr(yourApr);
    }
  }, [boostConfig, user_seeds_map]);
  useEffect(() => {
    getPoolFee();
    get_ve_seed_share();
  }, []);
  async function get_ve_seed_share() {
    const result = await getVeSeedShare();
    const maxShareObj = result?.accounts?.accounts[0] || {};
    const amount = maxShareObj?.amount;
    if (amount) {
      const amountStr = new BigNumber(amount).toFixed().toString();
      // const amountStr_readable = toReadableNumber(LOVE_TOKEN_DECIMAL, amountStr);
      const amountStr_readable = toReadableNumber(24, amountStr);
      setMaxLoveShareAmount(amountStr_readable);
    }
  }
  async function getPoolFee() {
    if (!pool) return;
    const feeCache = dayVolumeMap && dayVolumeMap[pool.id];
    if (feeCache) {
      setDayVolume(feeCache);
    } else {
      const fee = await get24hVolumes([pool.id.toString()]);
      setDayVolume(fee.join(", "));
    }
  }
  const goBacktoFarms = () => {
    router.push("/farms");
    emptyDetailData();
  };
  const displayImgs = () => {
    const tokenList: any[] = [];
    const tokens_sort = sort_tokens_by_base(tokens || []);
    tokens_sort.forEach((token: TokenMetadata) => {
      if (token.id === WRAP_NEAR_CONTRACT_ID) {
        token.icon = NEAR_META_DATA.icon;
      }
      tokenList.push(
        <label
          key={token.id}
          className={`h-7 w-7 rounded-full overflow-hidden border border-dark-90 -ml-1`}
        >
          <img src={token.icon} className="w-full h-full"></img>
        </label>
      );
    });
    return tokenList;
  };
  const displaySymbols = () => {
    let result = "";
    const tokens_meta_data = (pool && pool.tokens_meta_data) || [];
    const tokens_sort = sort_tokens_by_base(tokens_meta_data);
    tokens_sort.forEach((token: TokenMetadata, index: number) => {
      if (token.id === WRAP_NEAR_CONTRACT_ID) {
        token.symbol = NEAR_META_DATA.symbol;
      }
      const symbol = toRealSymbol(token.symbol);
      if (index === tokens_meta_data.length - 1) {
        result += symbol;
      } else {
        result += symbol + "-";
      }
    });
    return result;
  };
  function getYourApr() {
    if (!boostConfig) return "";
    const { affected_seeds } = boostConfig;
    const { seed_id } = detailData;
    if (typeof REF_VE_CONTRACT_ID === "undefined") return "";
    if (!affected_seeds || !seed_id || !(seed_id in affected_seeds)) {
      return "";
    }
    const user_seed = user_seeds_map[seed_id] || {};
    const love_user_seed = user_seeds_map[REF_VE_CONTRACT_ID] || {};
    const base = affected_seeds[seed_id];
    const hasUserStaked = Object.keys(user_seed).length;
    const { free_amount } = love_user_seed || {};
    const userLoveAmount = toReadableNumber(
      LOVE_TOKEN_DECIMAL,
      free_amount || "0"
    );
    if (base && hasUserStaked) {
      let rate;
      if (+userLoveAmount < 1) {
        rate = "1";
      } else {
        rate = new BigNumber(1)
          .plus(Math.log(+userLoveAmount) / Math.log(base))
          .toFixed();
      }
      setYourActualAprRate(rate);
      const apr = getActualTotalApr();
      let boostApr;
      if (apr) {
        boostApr = new BigNumber(apr).multipliedBy(rate);
      }
      if (boostApr && +boostApr > 0) {
        const r = +new BigNumber(boostApr).multipliedBy(100).toFixed();
        return toPrecision(r.toString(), 2) + "%";
      }
      return "";
    } else {
      return "";
    }
  }
  function isPending() {
    let pending: boolean = true;
    const farms = detailData.farmList || [];
    for (let i = 0; i < farms.length; i++) {
      if (farms[i].status != "Created" && farms[i].status != "Pending") {
        pending = false;
        break;
      }
    }
    return pending;
  }
  function getActualTotalApr() {
    const farms = detailData.farmList;
    let apr = "0";
    const allPendingFarms = isPending();
    farms &&
      farms.forEach(function (item: FarmBoost) {
        const pendingFarm =
          item.status == "Created" || item.status == "Pending";
        const itemApr = item.apr ? item.apr : "0";
        if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
          apr = new BigNumber(apr).plus(itemApr).toFixed();
        }
      });
    return apr;
  }
  function getTotalApr(containPoolFee: boolean = true) {
    let day24Volume = 0;
    if (containPoolFee) {
      day24Volume = +getPoolFeeApr(dayVolume);
    }
    const apr = getActualTotalApr();
    if (new BigNumber(apr).isEqualTo(0) && day24Volume == 0) {
      return "-";
    } else {
      const temp = new BigNumber(apr).multipliedBy(100).plus(day24Volume);
      if (temp.isLessThan(0.01)) {
        return "<0.01%";
      } else {
        return toPrecision(temp.toFixed(), 2) + "%";
      }
    }
  }
  function getPoolFeeApr(dayVolume: string) {
    let result = "0";
    if (dayVolume && detailData.pool) {
      const { total_fee, tvl } = detailData.pool;
      const revenu24h = (total_fee / 10000) * 0.8 * Number(dayVolume);
      if (tvl > 0 && revenu24h > 0) {
        const annualisedFeesPrct = ((revenu24h * 365) / tvl) * 100;
        const half_annualisedFeesPrct = annualisedFeesPrct;
        result = toPrecision(half_annualisedFeesPrct.toString(), 2);
      }
    }
    return result;
  }
  function getAprUpperLimit() {
    if (!boostConfig || !maxLoveShareAmount || +maxLoveShareAmount == 0)
      return "";
    const { affected_seeds } = boostConfig;
    const { seed_id } = detailData;
    if (!affected_seeds || !seed_id || !(seed_id in affected_seeds)) {
      return "";
    }
    const base = affected_seeds[seed_id];
    let rate;
    if (+maxLoveShareAmount < 1) {
      rate = 1;
    } else {
      rate = new BigNumber(1)
        .plus(Math.log(+maxLoveShareAmount) / Math.log(base))
        .toFixed(2);
    }
    const apr = getActualTotalApr();
    let boostApr;
    if (apr) {
      boostApr = new BigNumber(apr).multipliedBy(rate);
    }
    if (boostApr && +boostApr > 0) {
      const r = new BigNumber(boostApr).multipliedBy(100).toFixed();
      return (
        <span>
          <label className="mx-0.5">～</label>
          {toPrecision(r.toString(), 2) + "%"}
        </span>
      );
    }
    return "";
  }
  return (
    <main className="dark:text-white">
      {/* title */}
      <div className="w-full bg-farmTitleBg pt-8 pb-5">
        <div className="w-3/5 m-auto">
          <p
            className="text-gray-60 text-sm mb-3 cursor-pointer"
            onClick={goBacktoFarms}
          >{`<  Farms`}</p>
          <div className="ml-32">
            <div className="frcb mb-5">
              <div className="frcc">
                {displayImgs()}
                <p className="ml-1.5 text-2xl paceGrotesk-Bold">
                  {displaySymbols()}
                </p>
              </div>
              <div className="text-gray-60 text-sm frcc">
                Pool
                <div className="w-5 h-5 frcc bg-gray-100 rounded ml-1.5">
                  <FarmDetailsPoolIcon />
                </div>
              </div>
            </div>
            <div className="flex">
              <div className="pr-6 text-sm relative w-max mr-6">
                <div className="border-r border-gray-50 border-opacity-30 absolute right-0 top-1/4 h-1/2 w-0" />
                <p className="text-gray-50 mb-1">Total staked</p>
                <p>
                  {`${
                    detailData.seedTvl
                      ? `$${toInternationalCurrencySystem(
                          detailData.seedTvl,
                          2
                        )}`
                      : "-"
                  }`}
                </p>
              </div>
              <div className="pr-6 text-sm relative w-max mr-6">
                <div className="border-r border-gray-50 border-opacity-30 absolute right-0 top-1/4 h-1/2 w-0" />
                <p className="text-gray-50 mb-1">APR</p>
                <p>
                  {yourApr ? (
                    <div className="flex flex-col items-end justify-center">
                      <label className="text-white">{yourApr}</label>
                      <span className="text-sm text-primaryText">
                        ({getTotalApr()}
                        {aprUpLimit})
                      </span>
                    </div>
                  ) : (
                    <>
                      <label
                        className={`${aprUpLimit ? "text-xs" : "text-base"}`}
                      >
                        {getTotalApr()}
                      </label>
                      {aprUpLimit}
                    </>
                  )}
                </p>
              </div>
              <div className="pr-6 text-sm relative w-max">
                <p className="text-gray-50 mb-1">Rewards per week</p>
                <p>$140.14</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
