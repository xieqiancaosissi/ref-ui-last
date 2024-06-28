import {
  Seed,
  BoostConfig,
  toRealSymbol,
  FarmBoost,
  getVeSeedShare,
  mftGetBalance,
  getMftTokenId,
  getServerTime,
} from "@/services/farm";
import { FarmDetailsPoolIcon, QuestionMark } from "../icon";
import { TokenMetadata } from "@/services/ft-contract";
import { getEffectiveFarmList, sort_tokens_by_base } from "@/services/commonV3";
import useTokens from "@/hooks/useTokens";
import { useRouter } from "next/router";
import { WRAP_NEAR_CONTRACT_ID } from "@/services/wrap-near";
import { NEAR_META_DATA } from "@/utils/nearMetaData";
import {
  formatWithCommas,
  toInternationalCurrencySystem,
  toPrecision,
  toReadableNumber,
} from "@/utils/numbers";
import { useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { LOVE_TOKEN_DECIMAL } from "@/services/referendum";
import getConfig from "@/utils/config";
import { get24hVolumes } from "@/services/indexer";
import { CalcIcon } from "../icon/FarmBoost";
import CalcModelBooster from "./CalcModelBooster";
import CustomTooltip from "@/components/customTooltip/customTooltip";
import moment from "moment";
import { useAccountStore } from "@/stores/account";
import {
  LP_STABLE_TOKEN_DECIMALS,
  LP_TOKEN_DECIMALS,
} from "@/services/m-token";
import UserStakeBlock from "./FarmsDetailClaim";
import FarmsDetailStake from "./FarmsDetailStake";

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
  const [calcVisible, setCalcVisible] = useState(false);
  const aprUpLimit = getAprUpperLimit();
  const [lpBalance, setLpBalance] = useState("");
  const [showAddLiquidityEntry, setShowAddLiquidityEntry] = useState(false);
  const [serverTime, setServerTime] = useState<number>();
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.isSignedIn;
  function sortTokens(tokens: TokenMetadata[]) {
    tokens.sort((a: TokenMetadata, b: TokenMetadata) => {
      if (a.symbol === "NEAR") return 1;
      if (b.symbol === "NEAR") return -1;
      return 0;
    });
    return tokens;
  }
  useEffect(() => {
    getStakeBalance();
  }, [Object.keys(user_seeds_map).length, user_data_loading]);

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
  useEffect(() => {
    get_server_time();
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
  function mergeCommonRewardsFarms(farms: FarmBoost[]) {
    const tempMap: Record<string, FarmBoost> = {};
    farms.forEach((farm: FarmBoost) => {
      const { reward_token, daily_reward } = farm.terms;
      const preMergedfarms: FarmBoost = tempMap[reward_token];
      if (preMergedfarms) {
        if (farm.apr) {
          preMergedfarms.apr = new BigNumber(preMergedfarms.apr || "0")
            .plus(farm.apr)
            .toFixed()
            .toString();
        }
        preMergedfarms.terms.daily_reward = new BigNumber(
          preMergedfarms.terms.daily_reward
        )
          .plus(daily_reward)
          .toFixed();
      } else {
        tempMap[reward_token] = farm;
      }
    });
    return Object.values(tempMap);
  }
  const getStakeBalance = async () => {
    if (!isSignedIn) {
      setShowAddLiquidityEntry(false);
    } else {
      const poolId = pool?.id;
      if (!poolId) {
        console.error("Pool ID is undefined");
        return;
      }

      const b = await mftGetBalance(getMftTokenId(poolId.toString()));
      if (new Set(STABLE_POOL_IDS || []).has(poolId.toString())) {
        setLpBalance(toReadableNumber(LP_STABLE_TOKEN_DECIMALS, b));
      } else {
        setLpBalance(toReadableNumber(LP_TOKEN_DECIMALS, b));
      }

      const farmList = detailData?.farmList;
      if (!farmList || farmList.length === 0) {
        console.error("Farm list is undefined or empty");
        return;
      }

      const isEnded = farmList[0].status === "Ended";
      if (isEnded) {
        setShowAddLiquidityEntry(false);
      } else {
        const userSeed = user_seeds_map[detailData.seed_id];
        setShowAddLiquidityEntry(!Number(b) && !userSeed && !user_data_loading);
      }
    }
  };
  function getRewardsPerWeekTip() {
    const tempList: FarmBoost[] = detailData.farmList || [];
    const lastList: any[] = [];
    const pending_farms: FarmBoost[] = [];
    const no_pending_farms: FarmBoost[] = [];
    tempList.forEach((farm: FarmBoost) => {
      if (farm.status == "Created") {
        pending_farms.push(farm);
      } else {
        no_pending_farms.push(farm);
      }
    });
    if (pending_farms.length > 0) {
      pending_farms.forEach((farm: FarmBoost) => {
        const { decimals } = farm.token_meta_data || { decimals: 0 };
        const weekAmount = toReadableNumber(
          decimals,
          new BigNumber(farm.terms.daily_reward).multipliedBy(7).toFixed()
        );
        lastList.push({
          commonRewardToken: farm.token_meta_data,
          commonRewardTotalRewardsPerWeek: weekAmount,
          startTime: farm.terms.start_at,
          pending: true,
        });
      });
    }
    if (no_pending_farms.length > 0) {
      const mergedFarms = mergeCommonRewardsFarms(
        JSON.parse(JSON.stringify(no_pending_farms))
      );
      mergedFarms.forEach((farm: FarmBoost) => {
        const { decimals } = farm.token_meta_data || { decimals: 0 };
        const weekAmount = toReadableNumber(
          decimals,
          new BigNumber(farm.terms.daily_reward).multipliedBy(7).toFixed()
        );
        lastList.push({
          commonRewardToken: farm.token_meta_data,
          commonRewardTotalRewardsPerWeek: weekAmount,
        });
      });
    }
    function display_number(value: string | number) {
      if (!value) return value;
      const [whole, decimals] = value.toString().split(".");
      const whole_format = formatWithCommas(whole);
      if (+whole < 1 && decimals) {
        return whole_format + "." + decimals;
      } else {
        return whole_format;
      }
    }
    // show last display string
    const rewards_week_txt = "rewards_week";
    let result: string = `<div class="text-sm text-gray-10 frcb"><p>Rewards</p><p>Week</p></div>`;
    let itemHtml: string = "";
    lastList.forEach((item: any) => {
      const {
        commonRewardToken,
        commonRewardTotalRewardsPerWeek,
        pending,
        startTime,
      } = item;
      const token = commonRewardToken;
      if (token.id === WRAP_NEAR_CONTRACT_ID) {
        token.icon = NEAR_META_DATA.icon;
        token.symbol = NEAR_META_DATA.symbol;
        token.name = NEAR_META_DATA.name;
      }
      const txt = "start";
      if (pending) {
        itemHtml = `<div class="flex flex-col items-end my-2">
                        <div class="flex justify-between items-center w-full"><img class="w-4 h-4 rounded-full mr-7 border border-green-10" style="filter: grayscale(100%)" src="${
                          token.icon
                        }"/>
                        <label class="text-xs text-gray-10">${display_number(
                          commonRewardTotalRewardsPerWeek
                        )}</label>
                        </div>
  
                        <label class="text-xs text-gray-10 mt-0.5 ${
                          +startTime == 0 ? "hidden" : ""
                        }">${txt}: ${moment
          .unix(startTime)
          .format("YYYY-MM-DD")}</label>
                        <label class="text-xs text-gray-10 mt-0.5 ${
                          +startTime == 0 ? "" : "hidden"
                        }">Pending</label>
                      </div>`;
      } else {
        itemHtml = `<div class="flex justify-between items-center h-5 my-2">
                        <img class="w-4 h-4 rounded-full mr-7 border border-green-10" src="${
                          token.icon
                        }"/>
                        <label class="text-xs text-navHighLightText">${display_number(
                          commonRewardTotalRewardsPerWeek
                        )}</label>
                      </div>`;
      }

      result += itemHtml;
    });
    return result;
  }
  function totalTvlPerWeekDisplay() {
    const farms = detailData.farmList || [];
    const rewardTokenIconMap: Record<string, string> = {};
    let totalPrice = 0;
    const effectiveFarms = getEffectiveFarmList(farms);
    farms &&
      farms.forEach((farm: FarmBoost) => {
        const { id, icon } = farm.token_meta_data || { id: "", icon: "" };
        rewardTokenIconMap[id] = icon;
      });
    effectiveFarms.forEach((farm: FarmBoost) => {
      const { id, decimals } = farm.token_meta_data || { id: "", decimals: 0 };
      const { daily_reward } = farm.terms;
      const tokenPrice = tokenPriceList[id]?.price;
      if (tokenPrice && tokenPrice != "N/A") {
        const tokenAmount = toReadableNumber(decimals, daily_reward);
        totalPrice += +new BigNumber(tokenAmount)
          .multipliedBy(tokenPrice)
          .toFixed();
      }
    });
    totalPrice = +new BigNumber(totalPrice).multipliedBy(7).toFixed();
    const totalPriceDisplay =
      totalPrice == 0
        ? "-"
        : "$" + toInternationalCurrencySystem(totalPrice.toString(), 2);
    return (
      <>
        {totalPriceDisplay}
        {detailData?.farmList && detailData.farmList[0] && (
          <div
            className="text-white text-right ml-1.5"
            data-class="reactTip"
            data-tooltip-id={"rewardPerWeekId" + detailData.farmList[0].farm_id}
            data-place="top"
            data-tooltip-html={getRewardsPerWeekTip()}
          >
            <div className="flex items-center">
              {Object.entries(rewardTokenIconMap).map(([id, icon], index) => {
                if (id === WRAP_NEAR_CONTRACT_ID) {
                  icon = NEAR_META_DATA.icon;
                }
                return (
                  <img
                    src={icon}
                    key={index}
                    className={`w-4 h-4 rounded-full border border-primaryGreen ${
                      index !== 0 ? "-ml-1" : ""
                    }`}
                  ></img>
                );
              })}
            </div>

            <CustomTooltip
              id={"rewardPerWeekId" + detailData.farmList[0].farm_id}
            />
          </div>
        )}
      </>
    );
  }
  function getBoostMutil() {
    if (REF_VE_CONTRACT_ID && !boostConfig) return "";
    const { affected_seeds = {} } = boostConfig || {};
    const { seed_id } = detailData;
    if (!REF_VE_CONTRACT_ID) {
      return "";
    }
    const love_user_seed = user_seeds_map[REF_VE_CONTRACT_ID];
    const base = affected_seeds[seed_id];
    if (base && loveSeed) {
      const { free_amount = 0, locked_amount = 0 } = love_user_seed || {};
      const totalStakeLoveAmount = toReadableNumber(
        LOVE_TOKEN_DECIMAL,
        new BigNumber(free_amount).plus(locked_amount).toFixed()
      );
      if (+totalStakeLoveAmount > 0) {
        let result;
        if (+totalStakeLoveAmount < 1) {
          result = 1;
        } else {
          result = new BigNumber(1)
            .plus(Math.log(+totalStakeLoveAmount) / Math.log(base))
            .toFixed(2);
        }
        return result;
      }
      return "";
    }
    return "";
  }
  const get_server_time = async () => {
    const timestamp = await getServerTime();
    setServerTime(timestamp);
  };
  const radio = getBoostMutil();
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
                <p className="text-gray-50 mb-1 flex items-center">
                  APR
                  <QuestionMark className="ml-1.5"></QuestionMark>
                </p>
                <p className="frcc">
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
                      <label className="text-sm">{getTotalApr()}</label>
                      {aprUpLimit}
                    </>
                  )}
                  <CalcIcon
                    onClick={(e: any) => {
                      e.stopPropagation();
                      setCalcVisible(true);
                    }}
                    className="text-gray-60 ml-1.5 cursor-pointer hover:text-primaryGreen"
                  />
                </p>
              </div>
              <div className="pr-6 text-sm relative w-max">
                <p className="text-gray-50 mb-1 flex items-center">
                  Rewards per week{" "}
                  <QuestionMark className="ml-1.5"></QuestionMark>
                </p>
                <p className="flex items-center"> {totalTvlPerWeekDisplay()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* content */}
      <div className="w-3/5 pt-16 m-auto pb-8">
        <div className="ml-32 flex">
          <div className="flex-1 mr-2.5">
            <UserStakeBlock
              detailData={detailData}
              tokenPriceList={tokenPriceList}
              lpBalance={lpBalance}
              loveSeed={loveSeed}
              boostConfig={boostConfig}
              user_seeds_map={user_seeds_map}
              user_unclaimed_map={user_unclaimed_map}
              user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
              user_data_loading={user_data_loading}
              radio={radio}
            ></UserStakeBlock>
          </div>
          <div className="flex-1">
            <FarmsDetailStake
              detailData={detailData}
              tokenPriceList={tokenPriceList}
              stakeType="free"
              serverTime={serverTime ?? 0}
              lpBalance={lpBalance}
              loveSeed={loveSeed}
              boostConfig={boostConfig}
              user_seeds_map={user_seeds_map}
              user_unclaimed_map={user_unclaimed_map}
              user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
              user_data_loading={user_data_loading}
              radio={radio}
            ></FarmsDetailStake>
          </div>
        </div>
      </div>
      {calcVisible ? (
        <CalcModelBooster
          isOpen={calcVisible}
          onRequestClose={(e) => {
            e.stopPropagation();
            setCalcVisible(false);
          }}
          seed={detailData}
          tokenPriceList={tokenPriceList}
          loveSeed={loveSeed}
          boostConfig={boostConfig}
          user_seeds_map={user_seeds_map}
          user_unclaimed_map={user_unclaimed_map}
          user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
        />
      ) : null}
    </main>
  );
}
