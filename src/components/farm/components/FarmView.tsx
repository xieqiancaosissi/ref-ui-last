import {
  BoostConfig,
  FarmBoost,
  Seed,
  UserSeedInfo,
  claimRewardBySeed_boost,
  getPoolIdBySeedId,
} from "../../../services/farm";
import { useContext, useEffect, useMemo, useState } from "react";
import { useAccountStore } from "../../../stores/account";
import { ButtonTextWrapper } from "../../../components/common/Button";
import {
  get_pool_name,
  get_matched_seeds_for_dcl_pool,
  TOKEN_LIST_FOR_RATE,
  sort_tokens_by_base,
  getEffectiveFarmList,
  getPriceByPoint,
  displayNumberToAppropriateDecimals,
} from "../../../services/commonV3";
import { TokenMetadata } from "../../../services/ft-contract";
import { LOVE_TOKEN_DECIMAL } from "@/services/referendum";
import { isMobile } from "@/utils/device";
import {
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
  formatWithCommas,
} from "@/utils/numbers";
import BigNumber from "bignumber.js";
import { zeroPad } from "ethers/lib/utils";
import _ from "lodash";
import moment from "moment";
import { useHistory } from "react-router-dom";
import {
  LightningBase64Grey,
  LightningBase64,
  BoostOptIcon,
  NewTag,
  ForbiddonIcon,
  CalcIcon,
} from "../icon/FarmBoost";
import getConfig from "../../../utils/config";
import { NEAR_META_DATA, WNEAR_META_DATA } from "../../../utils/nearMetaData";
import { useTokens } from "../../../services/token";
import CustomTooltip from "../../customTooltip/customTooltip";

const {
  REF_VE_CONTRACT_ID,
  FARM_BLACK_LIST_V2,
  boostBlackList,
  REF_UNI_V3_SWAP_CONTRACT_ID,
  WRAP_NEAR_CONTRACT_ID,
} = getConfig();

export function FarmView(props: {
  seed: Seed;
  all_seeds?: Seed[];
  tokenPriceList: Record<string, any>;
  getDetailData: any;
  dayVolumeMap: Record<string, any>;
  boostConfig: BoostConfig;
  loveSeed: Seed;
  user_seeds_map: Record<string, UserSeedInfo>;
  user_unclaimed_map: Record<string, any>;
  user_unclaimed_token_meta_map: Record<string, any>;
  maxLoveShareAmount: string;
}) {
  const {
    seed,
    tokenPriceList,
    getDetailData,
    dayVolumeMap,
    boostConfig,
    loveSeed,
    user_seeds_map,
    user_unclaimed_map,
    user_unclaimed_token_meta_map,
    maxLoveShareAmount,
    all_seeds,
  } = props;
  const { pool, seedTvl, total_seed_amount, seed_id, farmList, seed_decimal } =
    seed;
  const [contractId, temp_pool_id] = seed_id.split("@");
  let is_dcl_pool = false;
  if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
    is_dcl_pool = true;
  }
  const { getIsSignedIn } = useAccountStore();
  const accountId = getIsSignedIn();
  const [claimLoading, setClaimLoading] = useState(false);
  const [calcVisible, setCalcVisible] = useState(false);
  const [dclCalcVisible, setDclCalcVisible] = useState(false);
  const [error, setError] = useState<Error>();
  const [aprSwitchStatus, setAprSwitchStatus] = useState("1");
  const [lpSwitchStatus, setLpSwitchStatus] = useState("1");
  const [yourApr, setYourApr] = useState("");
  const [yourActualAprRate, setYourActualAprRate] = useState("1");
  const tokens = sortTokens(seed.pool?.tokens_meta_data || []);
  const history = useHistory();
  const unClaimedTokens = useTokens(
    Object.keys(user_unclaimed_map[seed_id] || {})
  );
  //   const intl = useIntl();
  const rate_need_to_reverse_display = useMemo(() => {
    const tokens_meta_data = seed.pool?.tokens_meta_data;
    if (tokens_meta_data) {
      const [tokenX] = tokens_meta_data;
      if (TOKEN_LIST_FOR_RATE.indexOf(tokenX.symbol) > -1) return true;
      return false;
    }
    return false;
  }, [seed]);
  useEffect(() => {
    const yourApr = getYourApr();
    if (yourApr) {
      setYourApr(yourApr);
    }
  }, [boostConfig, user_seeds_map]);
  function sortTokens(tokens: TokenMetadata[]) {
    tokens.sort((a: TokenMetadata, b: TokenMetadata) => {
      if (a.symbol === "NEAR") return 1;
      if (b.symbol === "NEAR") return -1;
      return 0;
    });
    return tokens;
  }
  function getTotalApr(containPoolFee: boolean = true) {
    let dayVolume = 0;
    if (!seed || !seed.pool) {
      return "-";
    }
    if (containPoolFee) {
      dayVolume = +getPoolFeeApr(dayVolumeMap[seed.pool.id]);
    }
    const apr = getActualTotalApr();
    if (new BigNumber(apr).isEqualTo(0) && dayVolume == 0) {
      return "-";
    } else {
      const temp = new BigNumber(apr).multipliedBy(100).plus(dayVolume);
      if (temp.isLessThan(0.01)) {
        return "<0.01%";
      } else {
        return toPrecision(temp.toFixed(), 2) + "%";
      }
    }
  }
  function getActualTotalApr() {
    const farms = seed.farmList;
    let apr = "0";
    const allPendingFarms = isPending();
    farms?.forEach(function (item: FarmBoost) {
      const pendingFarm = item.status == "Created" || item.status == "Pending";
      if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
        const itemApr = item.apr ? item.apr : "0";
        apr = new BigNumber(apr).plus(new BigNumber(itemApr)).toFixed();
      }
    });
    return apr;
  }
  //   function getActualTotalBaseApr() {
  //     const farms = seed.farmList;
  //     let apr = 0;
  //     const allPendingFarms = isPending();
  //     farms?.forEach(function (item: FarmBoost) {
  //       const pendingFarm = item.status == "Created" || item.status == "Pending";
  //       if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
  //         apr = +new BigNumber(apr).plus(item.baseApr).toFixed();
  //       }
  //     });
  //     return apr;
  //   }
  function getAllRewardsSymbols() {
    const tempMap: {
      [key: string]: { icon: string; symbol: string; name: string };
    } = {};
    if (!seed || !seed.farmList) {
      return [];
    }
    seed.farmList.forEach((farm: FarmBoost) => {
      const { token_meta_data } = farm;
      if (token_meta_data) {
        const { id } = token_meta_data;
        let { icon, symbol, name } = token_meta_data;
        if (id === WRAP_NEAR_CONTRACT_ID) {
          icon = NEAR_META_DATA.icon;
          symbol = NEAR_META_DATA.symbol;
          name = NEAR_META_DATA.name;
        }

        if (icon && id) {
          tempMap[id] = { icon, symbol, name };
        }
      }
    });
    return Object.entries(tempMap);
  }

  function totalTvlPerWeekDisplay() {
    const farms = seed.farmList || [];
    const rewardTokenIconMap: { [key: string]: string } = {};
    let totalPrice = 0;
    const effectiveFarms = getEffectiveFarmList(farms);
    effectiveFarms.forEach((farm: FarmBoost) => {
      if (!farm.token_meta_data || farm.token_meta_data.id === undefined) {
        return;
      }
      const { id, decimals, icon } = farm.token_meta_data || {};
      const { daily_reward } = farm.terms;
      rewardTokenIconMap[id] = icon;
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
    return totalPriceDisplay;
  }
  function getAprTip() {
    const tempList = seed.farmList;
    const lastList: any[] = [];
    const pending_farms: FarmBoost[] = [];
    const no_pending_farms: FarmBoost[] = [];
    if (!seed || !seed.pool) {
      return "-";
    }
    const dayVolume = getPoolFeeApr(dayVolumeMap[seed.pool.id]);
    const [contractId, temp_mft_id] = seed.seed_id.split("@");
    let totalApr;
    const baseAPR = getTotalApr(false);
    const txt1 = "pool_fee_apr";
    const txt2 = "reward_apr";
    tempList?.forEach((farm: FarmBoost) => {
      if (farm.status == "Created") {
        pending_farms.push(farm);
      } else {
        no_pending_farms.push(farm);
      }
    });
    if (pending_farms.length > 0) {
      pending_farms.forEach((farm: FarmBoost) => {
        lastList.push({
          rewardToken: farm.token_meta_data,
          apr: new BigNumber(farm.apr || 0)
            .multipliedBy(100)
            .toFixed()
            .toString(),
          startTime: farm.terms.start_at,
          pending: true,
        });
      });
    }
    if (no_pending_farms.length > 0) {
      const mergedFarms = mergeCommonRewardsFarms(
        JSON.parse(JSON.stringify(no_pending_farms))
      ) as FarmBoost[];

      mergedFarms.forEach((farm: FarmBoost) => {
        lastList.push({
          rewardToken: farm.token_meta_data,
          apr: new BigNumber(farm.apr || 0)
            .multipliedBy(100)
            .toFixed()
            .toString(),
        });
      });
    }
    if (yourApr && +aprSwitchStatus == 1) {
      totalApr = yourApr;
    } else {
      totalApr = baseAPR;
    }
    // show last display string
    let result: string = "";
    const pool_fee_apr_dom =
      contractId != REF_UNI_V3_SWAP_CONTRACT_ID
        ? `<div class="flex items-center justify-between">
      <span class="text-xs text-navHighLightText mr-3">${txt1}</span>
      <span class="text-sm text-white font-bold">${
        +dayVolume > 0 ? dayVolume + "%" : "-"
      }</span>
    </div><div class="flex justify-end text-white text-sm font-bold ">+</div>`
        : "";
    result = `
      ${pool_fee_apr_dom} 
      <div class="flex items-center justify-between ">
        <span class="text-xs text-navHighLightText mr-3">${txt2}</span>
        <span class="text-sm text-white font-bold">${totalApr}</span>
      </div>
      `;
    if (yourApr && +aprSwitchStatus == 1) {
      const displayYourActualAprRate = new BigNumber(yourActualAprRate).toFixed(
        2
      );
      result += `<div class="flex items-center justify-end text-xs text-farmText">
          (${baseAPR}<span class="flex items-center ${
        +displayYourActualAprRate == 1 ? "text-farmText" : "text-senderHot"
      } text-xs ml-0.5">x${displayYourActualAprRate}<img src="${
        +displayYourActualAprRate == 1
          ? LightningBase64Grey()
          : LightningBase64()
      }"/></span>)
        </div>`;
    }
    function display_apr(apr: string) {
      const apr_big = new BigNumber(apr || 0);
      if (apr_big.isEqualTo(0)) {
        return "-";
      } else if (apr_big.isLessThan(0.01)) {
        return "<0.01%";
      } else {
        return formatWithCommas(toPrecision(apr, 2)) + "%";
      }
    }
    lastList.forEach((item: any) => {
      const { rewardToken, apr: baseApr, pending, startTime } = item;
      const token = rewardToken;
      let itemHtml = "";
      let apr = baseApr;
      if (yourApr && +aprSwitchStatus == 1 && yourActualAprRate) {
        apr = new BigNumber(apr).multipliedBy(yourActualAprRate).toFixed();
      }
      if (pending) {
        const startDate = moment.unix(startTime).format("YYYY-MM-DD");
        const txt = "start";
        itemHtml = `<div class="flex justify-between items-center h-8">
            <img class="w-5 h-5 rounded-full mr-7" style="filter: grayscale(100%)" src="${
              token.icon
            }"/>
            <div class="flex flex-col items-end">
              <label class="text-xs text-farmText">${display_apr(apr)}</label>
              <label class="text-xs text-farmText ${
                +startTime == 0 ? "hidden" : ""
              }">${txt}: ${startDate}</label>
              <label class="text-xs text-farmText mt-0.5 ${
                +startTime == 0 ? "" : "hidden"
              }">Pending</label>
            </div>
        </div>`;
      } else {
        itemHtml = `<div class="flex justify-between items-center h-8">
            <img class="w-5 h-5 rounded-full mr-7" src="${token.icon}"/>
            <label class="text-xs text-navHighLightText">${display_apr(
              apr
            )}</label>
        </div>`;
      }
      result += itemHtml;
    });
    return result;
  }
  function getPoolFeeApr(dayVolume: string) {
    let result = "0";
    if (dayVolume) {
      const total_fee = seed.pool?.total_fee;
      const tvl = seed.pool?.tvl;
      if (total_fee !== undefined && tvl !== undefined) {
        const revenu24h = (total_fee / 10000) * 0.8 * Number(dayVolume);
        if (tvl > 0 && revenu24h > 0) {
          const annualisedFeesPrct = ((revenu24h * 365) / tvl) * 100;
          const half_annualisedFeesPrct = annualisedFeesPrct;
          result = toPrecision(half_annualisedFeesPrct.toString(), 2);
        }
      }
    }
    return result;
  }
  function getUnClaimTip() {
    let resultTip = "";
    const { farmList, seed_id } = seed;
    const unclaimedMap = user_unclaimed_map[seed_id] || {};
    const tokenIds = Object.keys(unclaimedMap);
    const tempFarms: { [key: string]: boolean } = {};
    farmList?.forEach((farm: FarmBoost) => {
      tempFarms[farm.terms.reward_token] = true;
    });
    const isEnded =
      farmList && farmList.length > 0 ? farmList[0].status == "Ended" : false;
    tokenIds?.forEach((tokenId: string) => {
      const token: TokenMetadata = user_unclaimed_token_meta_map[tokenId] || {};
      // total price
      const { id, decimals, icon } = token;
      const amount = toReadableNumber(decimals, unclaimedMap[id] || "0");
      // rewards number
      let displayNum = "";
      if (new BigNumber("0").isEqualTo(amount)) {
        displayNum = "-";
      } else if (new BigNumber("0.001").isGreaterThan(amount)) {
        displayNum = "<0.001";
      } else {
        displayNum = new BigNumber(amount).toFixed(3, 1);
      }
      const txt = "ended_search";
      const itemHtml = `<div class="flex justify-between items-center h-8 active">
            <img class="w-5 h-5 rounded-full mr-7" src="${icon}"/>
              <div class="flex flex-col items-end text-xs text-navHighLightText">
              ${formatWithCommas(displayNum)}
              ${
                !isEnded && !tempFarms[id]
                  ? `<span class="text-farmText text-xs">${txt}</span>`
                  : ""
              }
            </div>
          </div>`;
      resultTip += itemHtml;
    });
    return resultTip;
  }
  function getRewardsPerWeekTip() {
    const tempList: FarmBoost[] = seed.farmList || [];
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
        const { token_meta_data, terms } = farm;
        if (token_meta_data) {
          const { decimals } = token_meta_data;
          const weekAmount = toReadableNumber(
            decimals,
            new BigNumber(terms.daily_reward).multipliedBy(7).toFixed()
          );
          lastList.push({
            commonRewardToken: token_meta_data,
            commonRewardTotalRewardsPerWeek: weekAmount,
            startTime: terms.start_at,
            pending: true,
          });
        }
      });
    }
    if (no_pending_farms.length > 0) {
      const mergedFarms = mergeCommonRewardsFarms(
        JSON.parse(JSON.stringify(no_pending_farms))
      );
      mergedFarms.forEach((farm: FarmBoost) => {
        const { token_meta_data, terms } = farm;
        if (token_meta_data) {
          const { decimals } = token_meta_data;
          const weekAmount = toReadableNumber(
            decimals,
            new BigNumber(terms.daily_reward).multipliedBy(7).toFixed()
          );
          lastList.push({
            commonRewardToken: token_meta_data,
            commonRewardTotalRewardsPerWeek: weekAmount,
          });
        }
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
    let result: string = `<div class="text-sm text-farmText pt-1">${rewards_week_txt}</div>`;
    let itemHtml: string = "";
    lastList.forEach((item: any) => {
      const {
        commonRewardToken,
        commonRewardTotalRewardsPerWeek,
        pending,
        startTime,
      } = item;
      const token = commonRewardToken;
      const txt = "start";
      if (pending) {
        itemHtml = `<div class="flex flex-col items-end my-2">
                        <div class="flex justify-between items-center w-full"><img class="w-5 h-5 rounded-full mr-7" style="filter: grayscale(100%)" src="${
                          token.icon
                        }"/>
                        <label class="text-xs text-farmText">${display_number(
                          commonRewardTotalRewardsPerWeek
                        )}</label>
                        </div>
  
                        <label class="text-xs text-farmText mt-0.5 ${
                          +startTime == 0 ? "hidden" : ""
                        }">${txt}: ${moment
          .unix(startTime)
          .format("YYYY-MM-DD")}</label>
                        <label class="text-xs text-farmText mt-0.5 ${
                          +startTime == 0 ? "" : "hidden"
                        }">Pending</label>
                      </div>`;
      } else {
        itemHtml = `<div class="flex justify-between items-center h-8 my-2">
                        <img class="w-5 h-5 rounded-full mr-7" src="${
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
  function mergeCommonRewardsFarms(farms: FarmBoost[]): FarmBoost[] {
    const tempMap: { [key: string]: FarmBoost } = {};
    farms.forEach((farm: FarmBoost) => {
      const { reward_token, daily_reward } = farm.terms;
      const preMergedfarms: FarmBoost = tempMap[reward_token];
      if (preMergedfarms) {
        preMergedfarms.apr = new BigNumber(preMergedfarms.apr || 0)
          .plus(farm.apr || 0)
          .toFixed()
          .toString();
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
  function isPending() {
    let pending: boolean = true;
    const farms = seed.farmList;
    if (farms && farms.length > 0) {
      for (let i = 0; i < farms.length; i++) {
        if (farms[i].status != "Created" && farms[i].status != "Pending") {
          pending = false;
          break;
        }
      }
    } else {
      pending = false;
    }
    return pending;
  }
  function isEnded() {
    const farms = seed.farmList;
    if (farms && farms.length > 0) {
      return farms[0].status == "Ended";
    }
    return false;
  }
  function haveUnclaimedReward() {
    if (user_unclaimed_map[seed.seed_id]) return true;
  }
  function goFarmDetailPage(seed: Seed) {
    getDetailData({
      detailData: seed,
      tokenPriceList,
      loveSeed,
      all_seeds,
    });
    const poolId = getPoolIdBySeedId(seed.seed_id);
    const status =
      seed.farmList && seed.farmList.length > 0
        ? seed.farmList[0].status === "Ended"
          ? "e"
          : "r"
        : "";
    let mft_id = poolId;
    if (is_dcl_pool) {
      const [contractId, temp_pool_id] = seed.seed_id.split("@");
      const [fixRange, pool_id, left_point, right_point] =
        temp_pool_id.split("&");
      mft_id = `${get_pool_name(pool_id)}[${left_point}-${right_point}]`;
    }
    history.replace(`/v2farms/${mft_id}-${status}`);
  }
  function claimReward() {
    if (claimLoading) return;
    setClaimLoading(true);
    claimRewardBySeed_boost(seed.seed_id)
      // .then(() => {
      //   window.location.reload();
      // })
      .catch((error) => {
        setClaimLoading(false);
        setError(error);
      });
  }
  function getBoostMutil() {
    if (REF_VE_CONTRACT_ID && !boostConfig) return "";
    const { affected_seeds = {} } = boostConfig || {};
    const { seed_id } = seed;
    const user_seed = user_seeds_map[seed_id] || {};
    const love_user_seed = REF_VE_CONTRACT_ID
      ? user_seeds_map[REF_VE_CONTRACT_ID]
      : undefined;
    const base = affected_seeds[seed_id];
    const hasUserStaked = Object.keys(user_seed).length;
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
        return (
          <div
            className={`absolute top-3 right-4 z-10 flex items-center justify-center px-2 py-0.5  text-xs  rounded-lg font-bold ${
              hasUserStaked
                ? "bg-lightGreenColor text-black"
                : "text-farmText border border-farmText"
            }`}
          >
            {`x${toPrecision(result.toString(), 2)}`}
          </div>
        );
      }
      const tip = "boostFarmTip";
      const result: string = `<div class="text-navHighLightText text-xs w-52 text-left">${tip}</div>`;
      return (
        <div className="absolute flex items-center justify-center top-3 right-4 z-10 px-2 py-0.5 rounded-lg text-greyCircleColor text-xs border border-farmText">
          <div
            className="text-white text-right"
            data-class="reactTip"
            data-tooltip-id="boostFarmTipId"
            data-place="top"
            data-tooltip-html={result}
          >
            <div className="flex items-center justify-center">
              <BoostOptIcon></BoostOptIcon>
              boost
            </div>
            {/* <CustomTooltip id="boostFarmTipId" /> */}
          </div>
        </div>
      );
    }
    return "";
  }
  function getAprUpperLimit() {
    if (!boostConfig || !maxLoveShareAmount || +maxLoveShareAmount == 0)
      return "";
    const { affected_seeds } = boostConfig;
    const { seed_id } = seed;
    const base = affected_seeds?.[seed_id];
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
      const r = +new BigNumber(boostApr).multipliedBy(100).toFixed();
      return (
        <span>
          <label className="mx-0.5">~</label>
          <label className="gotham_bold">
            {toPrecision(r.toString(), 2) + "%"}
          </label>
        </span>
      );
    }
    return "";
  }
  function getYourApr() {
    if (!boostConfig) return "";
    const { affected_seeds } = boostConfig;
    const { seed_id } = seed;
    const user_seed = user_seeds_map[seed_id] || {};
    const love_user_seed = REF_VE_CONTRACT_ID
      ? user_seeds_map[REF_VE_CONTRACT_ID]
      : undefined;
    const base = affected_seeds?.[seed_id];
    const hasUserStaked = Object.keys(user_seed).length;
    const { free_amount } = love_user_seed || {};
    const userLoveAmount = toReadableNumber(LOVE_TOKEN_DECIMAL, free_amount);
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
  function switchApr(e: any) {
    e.stopPropagation();
    if (+aprSwitchStatus == 1) {
      setAprSwitchStatus("2");
    } else {
      setAprSwitchStatus("1");
    }
  }
  //   const renderer = (countdown: any) => {
  //     if (countdown.completed) {
  //       return null;
  //     } else {
  //       return (
  //         <div style={{ width: "85px" }} className="whitespace-nowrap">
  //           {countdown.days ? countdown.days + "d: " : ""}
  //           {zeroPad(countdown.hours)}
  //           {"h"}: {zeroPad(countdown.minutes)}
  //           {"m"}
  //           {countdown.days ? "" : ": " + zeroPad(countdown.seconds) + "s"}
  //         </div>
  //       );
  //     }
  //   };
  function getStartTime() {
    let start_at: any[] = [];
    const farmList = seed.farmList;
    farmList?.forEach(function (item) {
      start_at.push(item.terms.start_at);
    });
    start_at = _.sortBy(start_at);
    start_at = start_at.filter(function (val) {
      return val != "0";
    });
    return start_at[0];
  }
  function isInMonth() {
    const endedStatus = isEnded();
    if (endedStatus) return false;
    const result = farmList?.find((farm: FarmBoost) => {
      const start_at = farm?.terms?.start_at;
      if (start_at == 0) return true;
      const one_month_seconds = 15 * 24 * 60 * 60;
      const currentA = new Date().getTime();
      const compareB = new BigNumber(start_at)
        .plus(one_month_seconds)
        .multipliedBy(1000);
      const compareResult = compareB.minus(currentA);
      if (compareResult.isGreaterThan(0)) {
        return true;
      }
    });
    if (result) return true;
    return false;
  }
  function status_is_new_or_will_end() {
    let status = "";
    if (is_dcl_pool && !isEnded()) {
      const poolId = pool?.pool_id || "";
      const matched_seeds = get_matched_seeds_for_dcl_pool({
        seeds: all_seeds || [],
        pool_id: poolId,
        sort: "new",
      });
      if (matched_seeds.length > 1) {
        const latestSeed = matched_seeds[0];
        if (latestSeed.seed_id == seed.seed_id) {
          status = "new";
        } else {
          status = "will end";
        }
      }
    }
    return status;
  }
  function showNewTag() {
    if (is_dcl_pool) {
      const status = status_is_new_or_will_end();
      if (status == "new" || (!status && isInMonth())) {
        return true;
      }
    } else {
      return isInMonth();
    }
  }
  function getForbiddenTip() {
    const tip = "farm_stop_tip";
    const result: string = `<div class="text-navHighLightText text-xs text-left">${tip}</div>`;
    return result;
  }
  function getRange() {
    const [fixRange, dcl_pool_id, left_point, right_point] =
      temp_pool_id.split("&");
    if (!pool || !pool.tokens_meta_data) {
      throw new Error("tokens_meta_data is undefined");
    }
    const [token_x_metadata, token_y_metadata] = pool.tokens_meta_data;
    const decimalRate =
      Math.pow(10, token_x_metadata.decimals) /
      Math.pow(10, token_y_metadata.decimals);
    let left_price = getPriceByPoint(+left_point, decimalRate);
    let right_price = getPriceByPoint(+right_point, decimalRate);
    if (rate_need_to_reverse_display) {
      const temp = left_price;
      left_price = new BigNumber(1).dividedBy(right_price).toFixed();
      right_price = new BigNumber(1).dividedBy(temp).toFixed();
    }
    const display_left_price = displayNumberToAppropriateDecimals(left_price);
    const display_right_price = displayNumberToAppropriateDecimals(right_price);

    return (
      <div className="flex items-center">
        <span className="text-base text-white">
          {display_left_price} ~ {display_right_price}
        </span>
        <span className="text-sm text-farmText ml-2">
          {rate_need_to_reverse_display ? (
            <>
              {token_x_metadata.symbol}/{token_y_metadata.symbol}
            </>
          ) : (
            <>
              {token_y_metadata.symbol}/{token_x_metadata.symbol}
            </>
          )}
        </span>
      </div>
    );
  }
  function getTotalUnclaimedRewards() {
    let totalPrice = 0;
    unClaimedTokens?.forEach((token: TokenMetadata) => {
      const { id, decimals } = token;
      const num = (user_unclaimed_map[seed.seed_id] || {})[id];
      const amount = toReadableNumber(decimals, num || "0");
      const tokenPrice = tokenPriceList[id]?.price;
      if (tokenPrice && tokenPrice != "N/A") {
        totalPrice += +amount * tokenPrice;
      }
    });
    if (totalPrice == 0) {
      return "-";
    } else if (new BigNumber("0.01").isGreaterThan(totalPrice)) {
      return "<$0.01";
    } else {
      return `$${toInternationalCurrencySystem(totalPrice.toString(), 2)}`;
    }
  }
  function toRealSymbol(symbol: string) {
    if (!symbol) return "";
    const blackList = ["nUSDO", "nKOK"];

    if (!symbol) return symbol;

    if (symbol === "nWETH" || symbol === "WETH") return "wETH";
    if (blackList.includes(symbol)) return symbol;
    return symbol?.charAt(0) === "n" &&
      symbol.charAt(1) === symbol.charAt(1).toUpperCase()
      ? symbol.substring(1)
      : symbol;
  }
  const isHaveUnclaimedReward = haveUnclaimedReward();
  const aprUpLimit = getAprUpperLimit();
  const needForbidden =
    pool &&
    (FARM_BLACK_LIST_V2 || []).indexOf(
      pool.id?.toString() || pool.pool_id?.toString() || ""
    ) > -1;
  const preprocessedTokens = tokens.map((token) => {
    if (token.id === WRAP_NEAR_CONTRACT_ID) {
      const newToken = { ...token };
      newToken.icon = NEAR_META_DATA.icon;
      newToken.symbol = NEAR_META_DATA.symbol;
      newToken.name = NEAR_META_DATA.name;
      return newToken;
    }
    return token;
  });
  const tokens_sort: TokenMetadata[] = sort_tokens_by_base(preprocessedTokens);
  return (
    <>
      <div
        onClick={() => {
          goFarmDetailPage(seed);
        }}
        className={`relative rounded-2xl cursor-pointer bg-cardBg p-5 ${
          isEnded() || needForbidden ? "farmEnded" : ""
        }
        `}
      >
        <div className="frcb mb-5">
          <div className="relative w-full h-14">
            {tokens_sort.length === 2 ? (
              <>
                {tokens_sort.map((token, index) => {
                  const isSecondToken = index === 1;
                  const sizeClass = isSecondToken ? "w-10 h-10" : "w-8 h-8";
                  const positionClass = isSecondToken
                    ? "absolute top-3 left-3 z-20"
                    : "absolute top-0 left-0 z-10";

                  return (
                    <label
                      key={token.id}
                      className={`rounded-full box-content overflow-hidden bg-cardBg border border-dark-90 ${sizeClass} ${positionClass}`}
                    >
                      <img src={token.icon} className="w-full h-full" />
                    </label>
                  );
                })}
              </>
            ) : (
              <div className="relative grid grid-cols-2 grid-rows-2 gap-0">
                {tokens_sort.map((token, index) => {
                  let zIndex = 10 + index;
                  if (index === 1 || index === 3) zIndex += 2;
                  if (index === 2 || index === 3) zIndex += 1;

                  const marginClass =
                    index === 1
                      ? "ml-[-34px]"
                      : index === 2
                      ? "mt-[-6px]"
                      : index === 3
                      ? "ml-[-34px] mt-[-6px]"
                      : "";

                  return (
                    <label
                      key={token.id}
                      className={`rounded-full box-content overflow-hidden bg-cardBg w-6 h-6 border border-dark-90 ${marginClass}`}
                      style={{ zIndex }}
                    >
                      <img src={token.icon} className="w-full h-full" />
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end ">
            <a
              href={`javascript:void(${"/pool/" + pool?.id})`}
              className="text-base"
              style={{ whiteSpace: "nowrap" }}
            >
              {tokens_sort.map((token, index) => {
                const hLine = index === tokens.length - 1 ? "" : "-";
                return `${toRealSymbol(token.symbol)}${hLine}`;
              })}
            </a>
            <div className="mt-1.5 frcc">
              <div
                className={`text-white text-right`}
                data-class="reactTip"
                data-tooltip-id={
                  "rewardPerWeekId" + (seed?.farmList?.[0]?.farm_id ?? "")
                }
                data-place="top"
                data-tooltip-html={getRewardsPerWeekTip()}
              >
                <div className="flex items-center bg-white bg-opacity-10 rounded-full p-0.5">
                  <span className="flex hover:bg-black hover:bg-opacity-20 rounded-full w-max">
                    {getAllRewardsSymbols().map(
                      (
                        [id, data]: [
                          string,
                          { icon: string; symbol: string; name: string }
                        ],
                        index
                      ) => {
                        return (
                          <img
                            key={id}
                            src={data.icon}
                            className={`h-4 w-4 rounded-full border border-green-10 ${
                              index != 0 ? "-ml-1" : ""
                            }`}
                          ></img>
                        );
                      }
                    )}
                  </span>
                  <span className="text-gray-10 text-xs mx-1.5">
                    {totalTvlPerWeekDisplay()}/week
                  </span>
                </div>
              </div>
              {showNewTag() ? <NewTag className="ml-1"></NewTag> : null}
            </div>
          </div>
        </div>
        <div className="frcb mb-3.5">
          <p className="text-gray-60 text-sm">Total staked</p>
          <p className="text-sm">
            {Number(seed.seedTvl) == 0
              ? "-"
              : `$${toInternationalCurrencySystem(seed.seedTvl || "", 2)}`}
          </p>
        </div>
        <div className="frcb mb-3.5">
          <p className="text-gray-60 text-sm">APR</p>
          <p className="text-sm frcc">
            {getTotalApr()}
            <CalcIcon
              onClick={(e: any) => {
                e.stopPropagation();
                setCalcVisible(true);
              }}
              className="text-farmText ml-1.5 cursor-pointer hover:text-greenColor"
            />
          </p>
        </div>
        <div className="frcb">
          <p className="text-gray-60 text-sm">Your stake/Reward</p>
          <p className="text-sm frcc">
            {isHaveUnclaimedReward ? (
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className="text-xl text-white"
                  data-type="info"
                  data-place="top"
                  data-multiline={true}
                  data-tip={getUnClaimTip()}
                  data-html={true}
                  data-tooltip-id={
                    "unclaimedId" + (seed?.farmList?.[0]?.farm_id ?? "")
                  }
                  data-class="reactTip"
                >
                  <div
                    className="flex items-center justify-center hover:bg-deepBlueHover rounded-lg text-sm text-white h-7 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      claimReward();
                    }}
                  >
                    <ButtonTextWrapper
                      loading={claimLoading}
                      Text={() => <>{getTotalUnclaimedRewards()}</>}
                    />
                  </div>
                  <CustomTooltip
                    id={"unclaimedId" + (seed?.farmList?.[0]?.farm_id ?? "")}
                  />
                </div>
              </div>
            ) : (
              <span className="text-sm text-farmText">-</span>
            )}
          </p>
        </div>
        <CustomTooltip
          id={"rewardPerWeekId" + (seed?.farmList?.[0]?.farm_id ?? "")}
        />
      </div>
      {/* {calcVisible ? (
        <CalcModelBooster
          isOpen={calcVisible}
          onRequestClose={(e) => {
            e.stopPropagation();
            setCalcVisible(false);
          }}
          seed={seed}
          boostConfig={boostConfig}
          loveSeed={loveSeed}
          tokenPriceList={tokenPriceList}
          user_seeds_map={user_seeds_map}
          user_unclaimed_map={user_unclaimed_map}
          user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
          style={{
            overlay: {
              backdropFilter: "blur(15px)",
              WebkitBackdropFilter: "blur(15px)",
            },
            content: {
              outline: "none",
              transform: "translate(-50%, -50%)",
            },
          }}
        />
      ) : null} */}
      {/* {dclCalcVisible ? (
        <CalcModelDcl
          isOpen={dclCalcVisible}
          onRequestClose={(e) => {
            e.stopPropagation();
            setDclCalcVisible(false);
          }}
          seed={seed}
          tokenPriceList={tokenPriceList}
          style={{
            overlay: {
              backdropFilter: "blur(15px)",
              WebkitBackdropFilter: "blur(15px)",
            },
            content: {
              outline: "none",
              transform: "translate(-50%, -50%)",
            },
          }}
        />
      ) : null} */}
    </>
  );
}
