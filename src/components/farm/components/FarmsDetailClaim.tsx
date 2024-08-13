import CustomTooltip from "@/components/customTooltip/customTooltip";
import useTokens from "@/hooks/useTokens";
import {
  Seed,
  BoostConfig,
  UserSeedInfo,
  FarmBoost,
  claimRewardBySeed_boost,
} from "@/services/farm";
import { TokenMetadata } from "@/services/ft-contract";
import {
  LP_STABLE_TOKEN_DECIMALS,
  LP_TOKEN_DECIMALS,
} from "@/services/m-token";
import { LOVE_TOKEN_DECIMAL } from "@/services/referendum";
import {
  toReadableNumber,
  toPrecision,
  formatWithCommas,
  toInternationalCurrencySystem,
} from "@/utils/numbers";
import BigNumber from "bignumber.js";
import { useState, useContext, useEffect, useMemo } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import { FarmDetailsUnion, QuestionMark } from "../icon";
import { LightningIcon } from "../icon/FarmBoost";
import { useAccountStore } from "@/stores/account";
import getConfig from "@/utils/config";
import { ButtonTextWrapper } from "@/components/common/Button";

const {
  STABLE_POOL_IDS,
  FARM_LOCK_SWITCH,
  REF_VE_CONTRACT_ID,
  FARM_BLACK_LIST_V2,
} = getConfig();
export default function UserStakeBlock(props: {
  detailData: Seed;
  tokenPriceList: any;
  lpBalance: string;
  loveSeed: Seed;
  boostConfig: BoostConfig;
  user_seeds_map: Record<string, UserSeedInfo>;
  user_unclaimed_token_meta_map: Record<string, any>;
  user_unclaimed_map: Record<string, any>;
  user_data_loading: Boolean;
  radio: string | number;
}) {
  const {
    detailData,
    tokenPriceList,
    lpBalance,
    loveSeed,
    boostConfig,
    user_seeds_map,
    user_unclaimed_token_meta_map,
    user_unclaimed_map,
    user_data_loading,
    radio,
  } = props;
  const [yourTvl, setYourTvl] = useState("");
  const { pool, min_locking_duration_sec, slash_rate, seed_id, seed_decimal } =
    detailData;
  const {
    free_amount = "0",
    shadow_amount = "0",
    locked_amount = "0",
    x_locked_amount = "0",
    unlock_timestamp,
    duration_sec,
  } = user_seeds_map[seed_id] || {};
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.isSignedIn;
  const [claimLoading, setClaimLoading] = useState(false);
  const DECIMALS =
    pool && new Set(STABLE_POOL_IDS || []).has(pool.id?.toString())
      ? LP_STABLE_TOKEN_DECIMALS
      : LP_TOKEN_DECIMALS;
  useEffect(() => {
    const { free_amount, shadow_amount, locked_amount } =
      user_seeds_map[seed_id] || {};
    const yourLp = toReadableNumber(
      seed_decimal,
      new BigNumber(free_amount || 0)
        .plus(locked_amount || 0)
        .plus(shadow_amount || 0)
        .toFixed()
    );
    if (pool) {
      const { tvl, id, shares_total_supply } = pool;
      const DECIMALS = new Set(STABLE_POOL_IDS || []).has(id?.toString())
        ? LP_STABLE_TOKEN_DECIMALS
        : LP_TOKEN_DECIMALS;
      const poolShares = Number(
        toReadableNumber(DECIMALS, shares_total_supply)
      );
      const yourTvl =
        poolShares == 0
          ? 0
          : Number(
              toPrecision(((Number(yourLp) * tvl) / poolShares).toString(), 2)
            );
      if (yourTvl) {
        setYourTvl(yourTvl.toString());
      }
    }
  }, [Object.keys(user_seeds_map || {})]);

  function getUserPower() {
    if (REF_VE_CONTRACT_ID && !boostConfig) return "";
    let realRadio;
    const affected_seeds = boostConfig?.affected_seeds || {};
    const seed_id = detailData?.seed_id;
    const love_user_seed = REF_VE_CONTRACT_ID
      ? user_seeds_map?.[REF_VE_CONTRACT_ID]
      : undefined;
    const base = affected_seeds[seed_id];
    if (base && loveSeed) {
      const { free_amount = 0, locked_amount = 0 } = love_user_seed || {};
      const totalStakeLoveAmount = toReadableNumber(
        LOVE_TOKEN_DECIMAL,
        new BigNumber(free_amount).plus(locked_amount).toFixed()
      );
      if (+totalStakeLoveAmount > 0) {
        if (+totalStakeLoveAmount < 1) {
          realRadio = 1;
        } else {
          realRadio = new BigNumber(1)
            .plus(Math.log(+totalStakeLoveAmount) / Math.log(base))
            .toFixed();
        }
      }
    }
    const powerBig = new BigNumber(+(realRadio || 1))
      .multipliedBy(BigNumber(free_amount).plus(shadow_amount))
      .plus(x_locked_amount);
    const power = toReadableNumber(DECIMALS, powerBig.toFixed(0).toString());
    return power;
  }
  function showLpPower() {
    const power = getUserPower();
    const powerBig = new BigNumber(power);
    if (powerBig.isEqualTo(0)) {
      return <label className="opacity-50">{isSignedIn ? 0.0 : "-"}</label>;
    } else if (powerBig.isLessThan("0.001")) {
      return "<0.001";
    } else {
      return formatWithCommas(toPrecision(power, 3));
    }
  }
  function getUserLpPercent() {
    let result = "0%";
    const { total_seed_power } = detailData;
    const userPower = getUserPower();
    if (+total_seed_power && !user_data_loading && +userPower) {
      const totalAmount = toReadableNumber(DECIMALS, total_seed_power);
      const percent = new BigNumber(userPower)
        .dividedBy(totalAmount)
        .multipliedBy(100);
      if (percent.isLessThan("0.001")) {
        result = "<0.001%";
      } else {
        result = `${toPrecision(percent.toFixed().toString(), 3)}%`;
      }
    }
    return result;
  }
  function getTotalUnclaimedRewards() {
    let totalPrice = 0;
    let resultTip = "";
    const tempFarms: { [key: string]: boolean } = {};
    if (detailData.farmList) {
      detailData.farmList.forEach((farm: FarmBoost) => {
        tempFarms[farm.terms.reward_token] = true;
      });
    }
    const isEnded = detailData.farmList
      ? detailData.farmList[0].status == "Ended"
      : false;
    const unclaimed = user_unclaimed_map[seed_id] || {};
    const unClaimedTokenIds = Object.keys(unclaimed);
    const tokenList: any[] = [];
    unClaimedTokenIds?.forEach((tokenId: string) => {
      const token: TokenMetadata = user_unclaimed_token_meta_map[tokenId];
      // total price
      const { id, decimals, icon } = token;
      const amount = toReadableNumber(decimals, unclaimed[id] || "0");
      const tokenPrice = tokenPriceList[id]?.price;
      if (tokenPrice && tokenPrice != "N/A") {
        totalPrice += +amount * tokenPrice;
      }
      // rewards number
      let displayNum = "";
      if (new BigNumber("0").isEqualTo(amount)) {
        displayNum = "-";
      } else if (new BigNumber("0.001").isGreaterThan(amount)) {
        displayNum = "<0.001";
      } else {
        displayNum = new BigNumber(amount).toFixed(3, 1);
      }
      // before boost number
      let beforeNum = "";
      if (radio) {
        const v = new BigNumber(amount).dividedBy(radio);
        if (new BigNumber("0").isEqualTo(v)) {
          beforeNum = "-";
        } else if (new BigNumber("0.001").isGreaterThan(v)) {
          beforeNum = "<0.001";
        } else {
          beforeNum = new BigNumber(v).toFixed(3, 1);
        }
      }
      const tempTokenData = {
        token,
        amount: displayNum,
        preAmount: beforeNum,
      };
      tokenList.push(tempTokenData);
      const txt = "ended_search";
      const itemHtml = `<div class="flex justify-between items-center h-8 active">
          <img class="w-5 h-5 rounded-full mr-7" src="${icon}"/>
            <div class="flex flex-col items-end text-xs text-navHighLightText">
            ${formatWithCommas(displayNum)}
            ${
              !isEnded && !tempFarms[id]
                ? `<span class="text-gray-10 text-xs">${txt}</span>`
                : ""
            }
          </div>
        </div>`;
      resultTip += itemHtml;
    });
    if (totalPrice == 0) {
      return {
        worth: <label className="opacity-30">{isSignedIn ? "$0" : "-"}</label>,
        showClaimButton: false,
        tip: resultTip,
        list: tokenList,
      };
    } else if (new BigNumber("0.01").isGreaterThan(totalPrice)) {
      return {
        worth: "<$0.01",
        showClaimButton: true,
        tip: resultTip,
        list: tokenList,
      };
    } else {
      return {
        worth: `$${toInternationalCurrencySystem(totalPrice.toString(), 2)}`,
        showClaimButton: true,
        tip: resultTip,
        list: tokenList,
      };
    }
  }
  const unclaimedRewardsData = useMemo(() => {
    return getTotalUnclaimedRewards();
  }, [user_unclaimed_map[seed_id]]);
  function claimReward() {
    if (claimLoading) return;
    setClaimLoading(true);
    claimRewardBySeed_boost(detailData.seed_id)
      // .then(() => {
      //   window.location.reload();
      // })
      .catch((error) => {
        setClaimLoading(false);
        // setError(error);
      });
  }
  function getPowerTip() {
    if (REF_VE_CONTRACT_ID && !boostConfig) return "";
    const { affected_seeds = {} } = boostConfig || {};
    const { seed_id } = detailData;
    const base = affected_seeds[seed_id];
    const tip = base
      ? "Your Power = Your staked LP Tokens * booster (by staking LOVE)"
      : "Your Power = Your staked LP Tokens";
    const result: string = `<div class="text-gray-110 text-xs w-52 text-left">${tip}</div>`;
    return result;
  }
  function valueOfRewardsTip() {
    const tip = "Indicative value based on prices and not actual execution";
    const result: string = `<div class="text-gray-110 text-xs w-52 text-left">${tip}</div>`;
    return result;
  }
  return (
    <>
      <div className="bg-dark-10 rounded-md p-5 mb-2.5 xsm:bg-dark-210">
        <div className="mb-5">
          <p className="flex items-center text-gray-50 text-sm mb-1.5">
            Your Power{" "}
            <div
              className="text-white text-right ml-1"
              data-class="reactTip"
              data-tooltip-id="powerTipId"
              data-place="top"
              data-tooltip-html={getPowerTip()}
            >
              <QuestionMark className="ml-1.5"></QuestionMark>
              <CustomTooltip id="powerTipId" />
            </div>
          </p>
          <p className="text-2xl xsm:text-primaryGreen">{showLpPower()}</p>
        </div>
        <div className="flex">
          <div className="flex-1">
            <p className="flex items-center text-gray-50 text-sm mb-1.5">
              Value
            </p>
            <p className="text-2xl xsm:text-white">
              {Number(yourTvl) == 0 ? (
                <span className="opacity-50">$0</span>
              ) : (
                "$" + toInternationalCurrencySystem(yourTvl, 2)
              )}
            </p>
          </div>
          <div className="flex-1">
            <p className="flex items-center text-gray-50 text-sm mb-1.5">
              Your Share
            </p>
            <p
              className={`text-2xl xsm:text-white ${
                getUserLpPercent() === "0%" ? "opacity-50" : ""
              }`}
            >
              {getUserLpPercent()}
            </p>
          </div>
        </div>
      </div>
      <div
        className="bg-dark-10 rounded-md p-5 xsm:bg-dark-210 xsm:text-white"
        style={{ height: "108px" }}
      >
        <p className="flex items-center text-gray-50 text-sm mb-1.5">
          Unclaimed rewards{" "}
          <div
            className="text-white text-right ml-1"
            data-class="reactTip"
            data-tooltip-id={"unclaimedRewardQIdx"}
            data-place="top"
            data-tooltip-html={valueOfRewardsTip()}
          >
            <QuestionMark className="ml-1.5"></QuestionMark>
            <CustomTooltip id={"unclaimedRewardQIdx"} />
          </div>
        </p>
        {isSignedIn ? (
          <div className="frcb">
            <p className="text-2xl flex">
              <FarmDetailsUnion className="mr-4" />
              {unclaimedRewardsData.worth}
            </p>
            {unclaimedRewardsData.showClaimButton ? (
              <div
                className="border border-green-10 rounded frcc py-2 px-7 text-green-10 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  claimReward();
                }}
              >
                <ButtonTextWrapper
                  loading={claimLoading}
                  Text={() => <>Claim</>}
                />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="opacity-50 mt-4">-</div>
        )}
      </div>
    </>
  );
}
