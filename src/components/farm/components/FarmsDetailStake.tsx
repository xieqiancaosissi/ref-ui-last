import {
  Seed,
  BoostConfig,
  UserSeedInfo,
  stake_boost,
  getMftTokenId,
  get_config,
  unStake_boost,
  stake_boost_shadow,
  mftGetBalance,
  unStake_boost_shadow,
} from "@/services/farm";
import { useEffect, useState } from "react";
import styles from "../farm.module.css";
import {
  LP_STABLE_TOKEN_DECIMALS,
  LP_TOKEN_DECIMALS,
} from "@/services/m-token";
import {
  toNonDivisibleNumber,
  toPrecision,
  toReadableNumber,
} from "@/utils/numbers";
import getConfig from "@/utils/config";
import BigNumber from "bignumber.js";
import { ButtonTextWrapper } from "@/components/common/Button";
import {
  ArrowDownHollow,
  FarmDetailsWarn,
  GoldLevel1,
  GoldLevel2,
  GoldLevel3,
  GoldLevel4,
  VEARROW,
} from "../icon";
import { CalcEle } from "./CalcEle";
import { CalcIcon } from "../icon/FarmBoost";
import { useAccountStore } from "@/stores/account";
import { showWalletSelectorModal } from "@/utils/wallet";
import { useAppStore } from "@/stores/app";
import getConfigV2 from "@/utils/configV2";

const {
  STABLE_POOL_IDS,
  FARM_LOCK_SWITCH,
  REF_VE_CONTRACT_ID,
  FARM_BLACK_LIST_V2,
} = getConfig();
const configV2 = getConfigV2();
export default function FarmsDetailStake(props: {
  detailData: Seed;
  tokenPriceList: any;
  lpBalance: string;
  stakeType: string;
  serverTime: number;
  loveSeed: Seed;
  boostConfig: BoostConfig;
  user_seeds_map: Record<string, UserSeedInfo>;
  user_unclaimed_token_meta_map: Record<string, any>;
  user_unclaimed_map: Record<string, any>;
  user_data_loading: Boolean;
  radio: string | number;
  activeMobileTab?: string;
}) {
  const {
    detailData,
    lpBalance,
    stakeType,
    serverTime,
    tokenPriceList,
    loveSeed,
    boostConfig,
    user_seeds_map,
    user_unclaimed_token_meta_map,
    user_unclaimed_map,
    activeMobileTab,
    user_data_loading,
  } = props;
  const {
    pool,
    min_locking_duration_sec,
    total_seed_amount,
    total_seed_power,
    min_deposit,
    seed_id,
  } = detailData;
  const DECIMALS =
    pool && new Set(STABLE_POOL_IDS || []).has(pool.id?.toString())
      ? LP_STABLE_TOKEN_DECIMALS
      : LP_TOKEN_DECIMALS;
  const {
    free_amount = "0",
    locked_amount = "0",
    x_locked_amount = "0",
    unlock_timestamp,
    duration_sec,
  } = user_seeds_map[seed_id] || {};
  const appStore = useAppStore();
  const { getIsSignedIn } = useAccountStore();
  const isSignedIn = getIsSignedIn();
  const freeAmount = toReadableNumber(DECIMALS, free_amount);
  const lockedAmount = toReadableNumber(DECIMALS, locked_amount);
  const [selectedLockData, setSelectedLockData] = useState<Lock | null>(null);
  const [lockDataList, setLockDataList] = useState<Lock[]>([]);
  const [stakeLoading, setStakeLoading] = useState(false);
  const [unStakeLoading, setUnStakeLoading] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [amount, setAmount] = useState(
    stakeType == "freeToLock" ? freeAmount : ""
  );
  const [activeTab, setActiveTab] = useState(activeMobileTab || "stake");
  const [amountAvailableCheck, setAmountAvailableCheck] = useState(true);
  const lpBalances = toReadableNumber(DECIMALS, free_amount);
  const [sharesInfo, setSharesInfo] = useState<{
    sharesInPool: string | number;
    amountByShadowInFarm: string | number;
    amountByTransferInFarm: string | number;
  }>({
    sharesInPool: "0",
    amountByShadowInFarm: "0",
    amountByTransferInFarm: "0",
  });
  useEffect(() => {
    if (!user_data_loading) {
      getSharesInfo();
    }
  }, [Object.keys(user_seeds_map).length, user_data_loading]);
  async function getSharesInfo() {
    const { seed_id } = detailData;
    const { free_amount, shadow_amount } = user_seeds_map[seed_id] || {};
    const poolId = pool?.id || "";
    const sharesInPool = await mftGetBalance(getMftTokenId(poolId.toString()));
    const amountByShadowInFarm = shadow_amount;
    const amountByTransferInFarm = free_amount;
    setSharesInfo({
      sharesInPool: sharesInPool || "0",
      amountByShadowInFarm: amountByShadowInFarm || "0",
      amountByTransferInFarm: amountByTransferInFarm || "0",
    });
  }
  useEffect(() => {
    if (stakeType !== "free") {
      const goldList = [
        <GoldLevel1 key="1" />,
        <GoldLevel2 key="2" />,
        <GoldLevel3 key="3" />,
        <GoldLevel4 key="4" />,
      ];
      const lockable_duration_month = [1, 3, 6, 12];
      const lockable_duration_second = lockable_duration_month.map(
        (duration: number, index: number) => {
          return {
            second: duration * 2592000,
            month: duration,
            icon: goldList[index],
          };
        }
      );
      let restTime_sec = 0;
      const user_seed = user_seeds_map[seed_id];
      if (user_seed.unlock_timestamp) {
        restTime_sec = new BigNumber(user_seed.unlock_timestamp)
          .minus(serverTime)
          .dividedBy(1000000000)
          .toNumber();
      }
      get_config().then((config) => {
        const list: any = [];
        const { maximum_locking_duration_sec, max_locking_multiplier } = config;
        lockable_duration_second.forEach(
          (item: { second: number; month: number; icon: any }, index) => {
            if (
              item.second >= Math.max(min_locking_duration_sec, restTime_sec) &&
              item.second <= maximum_locking_duration_sec
            ) {
              const locking_multiplier =
                ((max_locking_multiplier - 10000) * item.second) /
                (maximum_locking_duration_sec * 10000);
              list.push({
                ...item,
                multiplier: locking_multiplier,
              });
            }
          }
        );
        setLockDataList(list);
        setSelectedLockData(list[0]);
      });
    }
  }, [stakeType]);
  function changeAmount(value: string) {
    setAmount(value);
    // check
    const curValue = toNonDivisibleNumber(DECIMALS, value);
    if (value && new BigNumber(curValue).isLessThan(min_deposit)) {
      setAmountAvailableCheck(false);
    } else {
      setAmountAvailableCheck(true);
    }
  }
  function displayLpBalance() {
    if (lpBalance) {
      return toPrecision(lpBalance || "0", 3);
    }
  }
  const isDisabled =
    !amount ||
    !amountAvailableCheck ||
    new BigNumber(amount).isLessThanOrEqualTo(0) ||
    (stakeType !== "free" &&
      min_locking_duration_sec > 0 &&
      FARM_LOCK_SWITCH != 0);
  function operationStake() {
    setStakeLoading(true);
    let msg = "";
    if (
      stakeType == "free" ||
      min_locking_duration_sec == 0 ||
      FARM_LOCK_SWITCH == 0
    ) {
      msg = JSON.stringify("Free");
    } else if (stakeType === "lock" && selectedLockData) {
      msg = JSON.stringify({
        Lock: {
          duration_sec: selectedLockData.second,
        },
      });
    }
    if (
      configV2.SUPPORT_SHADOW_POOL_IDS.includes((pool?.id || "").toString())
    ) {
      stake_boost_shadow({
        pool_id: +(pool?.id || ""),
        amount: toNonDivisibleNumber(DECIMALS, amount),
        amountByTransferInFarm: sharesInfo.amountByTransferInFarm,
        seed_id,
      });
    } else {
      stake_boost({
        token_id: getMftTokenId((pool?.id || "").toString()),
        amount: toNonDivisibleNumber(DECIMALS, amount),
        msg,
      });
    }
  }
  function operationUnStake() {
    setUnStakeLoading(true);
    if (
      configV2.SUPPORT_SHADOW_POOL_IDS.includes((pool?.id || "").toString())
    ) {
      unStake_boost_shadow({
        seed_id,
        unlock_amount: "0",
        withdraw_amount: toNonDivisibleNumber(DECIMALS, amount),
        amountByTransferInFarm: sharesInfo.amountByTransferInFarm,
      });
    } else {
      unStake_boost({
        seed_id,
        unlock_amount: "0",
        withdraw_amount: toNonDivisibleNumber(DECIMALS, amount),
      });
    }
  }
  function showWalletSelector() {
    showWalletSelectorModal(appStore.setShowRiskModal);
  }
  const isEnded = detailData?.farmList?.[0]?.status == "Ended";
  return (
    <div className="bg-dark-10 rounded-md p-5 xsm:p-0">
      <div className="flex items-center mb-4 xsm:mb-7 xsm:border-b xsm:border-white xsm:border-opacity-10 xsm:px-4">
        <button
          className={`text-lg pr-5 xsm:flex-1 ${
            activeTab === "stake" ? styles.gradient_text : "text-gray-500"
          } ${isEnded ? "hidden" : ""}`}
          onClick={() => setActiveTab("stake")}
        >
          Stake
        </button>
        {isEnded && Number(freeAmount) > 0 && (
          <div className="h-4 bg-gray-50 xsm:hidden" style={{ width: "2px" }} />
        )}
        <button
          className={`text-lg pl-5 xsm:flex-1 ${
            activeTab === "unstake" ? styles.gradient_text : "text-gray-500"
          }  ${Number(freeAmount) > 0 ? "" : "hidden"}`}
          onClick={() => setActiveTab("unstake")}
        >
          Unstake
        </button>
      </div>
      {activeTab === "stake" && (
        <div className="xsm:px-4">
          <div className="lg:hidden mb-2.5 frcb">
            <div>
              {isSignedIn ? displayLpBalance() : "0"}
              <span className="text-gray-10 ml-1">available to stake</span>
            </div>
            <div>
              <span
                onClick={() => {
                  lpBalance;
                }}
                className={`text-sm text-gray-50 underline cursor-pointer hover:text-primaryGreen `}
              >
                Max
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center h-16 px-3 bg-dark-60 rounded-lg xsm:mb-2.5">
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={({ target }) => changeAmount(target.value)}
              className="text-white text-lg focus:outline-non appearance-none leading-tight"
            ></input>
            <div className="flex items-center ml-2">
              <span
                onClick={() => {
                  changeAmount(
                    stakeType == "freeToLock" ? freeAmount : lpBalance
                  );
                }}
                className={`text-sm text-gray-50 underline cursor-pointer hover:text-primaryGreen xsm:hidden`}
              >
                Max
              </span>
            </div>
          </div>
          {amountAvailableCheck ? null : (
            <div className="flex justify-center mt-2.5">
              <div className="w-full bg-yellow-10 bg-opacity-10 rounded py-2 px-2.5 text-yellow-10 text-sm flex items-center">
                {isSignedIn ? toReadableNumber(DECIMALS, min_deposit) : "0"}
                <p className="ml-1 mr-2">available to stake</p>
                {/* <p className="underline frcc">
                  Add liquidity <VEARROW className="ml-1.5"></VEARROW>
                </p> */}
              </div>
            </div>
          )}
          <div
            className="lg:hidden bg-gary-20 rounded mb-6"
            onClick={() => {
              setShowCalc(!showCalc);
            }}
          >
            <div className="frcb">
              <div className="flex items-center mb-2">
                <CalcIcon />
                <label className="text-sm text-gray-10 ml-3 mr-4  cursor-pointer">
                  ROI Calculator
                </label>
              </div>
              <div
                className={
                  "cursor-pointer " +
                  (showCalc
                    ? "transform rotate-180 text-white"
                    : "text-gray-10")
                }
                onClick={() => setShowCalc(!showCalc)}
              >
                <ArrowDownHollow />
              </div>
            </div>
            {showCalc ? (
              <div className={"w-full"}>
                <CalcEle
                  seed={detailData}
                  tokenPriceList={tokenPriceList}
                  lpTokenNumAmount={amount}
                  loveSeed={loveSeed}
                  boostConfig={boostConfig}
                  user_seeds_map={user_seeds_map}
                  user_unclaimed_map={user_unclaimed_map}
                  user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
                ></CalcEle>
              </div>
            ) : null}
          </div>
          <div className="mt-2.5 text-sm mb-6 xsm:hidden">
            {isSignedIn ? displayLpBalance() : "0"}
            <span className="text-gray-10 ml-1">available to stake</span>
          </div>
          {isSignedIn ? (
            <div
              onClick={() => {
                if (!isDisabled) {
                  operationStake();
                }
              }}
              className={`w-full h-11 frcc rounded paceGrotesk-Bold text-base ${
                isDisabled
                  ? "cursor-not-allowed bg-gray-40 text-gray-50"
                  : "bg-greenGradient text-black cursor-pointer"
              }`}
            >
              <ButtonTextWrapper
                loading={stakeLoading}
                Text={() => <>Stake</>}
              />
            </div>
          ) : (
            <div
              className="frcc text-primaryGreen border border-primaryGreen py-2.5 rounded-md cursor-pointer"
              onClick={showWalletSelector}
            >
              Connect Wallet
            </div>
          )}
          <div className="mt-5 xsm:hidden">
            <div
              className="flex items-center justify-between mb-2 cursor-pointer"
              onClick={() => {
                setShowCalc(!showCalc);
              }}
            >
              <div className="frcc">
                <CalcIcon />
                <label className="text-sm text-gray-10 ml-3 mr-4  cursor-pointer">
                  ROI Calculator
                </label>
              </div>
              <div
                className={
                  "cursor-pointer " +
                  (showCalc
                    ? "transform rotate-180 text-white"
                    : "text-gray-10")
                }
                onClick={() => setShowCalc(!showCalc)}
              >
                <ArrowDownHollow />
              </div>
            </div>
            {showCalc ? (
              <div className={"w-full"}>
                <CalcEle
                  seed={detailData}
                  tokenPriceList={tokenPriceList}
                  lpTokenNumAmount={amount}
                  loveSeed={loveSeed}
                  boostConfig={boostConfig}
                  user_seeds_map={user_seeds_map}
                  user_unclaimed_map={user_unclaimed_map}
                  user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
                ></CalcEle>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {activeTab === "unstake" && (
        <div className="xsm:px-4">
          <div className="flex justify-between items-center h-16 px-3 bg-dark-60 rounded-lg">
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={({ target }) => changeAmount(target.value)}
              className="text-white text-lg focus:outline-non appearance-none leading-tight"
            ></input>
            <div className="flex items-center ml-2">
              <span
                onClick={() => {
                  changeAmount(freeAmount);
                }}
                className={`text-sm text-gray-50 underline cursor-pointer hover:text-primaryGreen`}
              >
                Max
              </span>
            </div>
          </div>
          <div className="mt-2.5 text-sm mb-6 frcb">
            <p className="text-gray-10 ml-1">Lp Tokens</p>
            <p> {toPrecision(lpBalances, 6)}</p>
          </div>
          <div
            onClick={() => {
              if (!isDisabled) {
                operationUnStake();
              }
            }}
            className={`w-full h-11 frcc rounded paceGrotesk-Bold text-base ${
              isDisabled
                ? "cursor-not-allowed bg-gray-40 text-gray-50"
                : "text-green-10 border border-green-10 cursor-pointer"
            }`}
          >
            <ButtonTextWrapper
              loading={unStakeLoading}
              Text={() => <>Unstake</>}
            />
          </div>
          <div className="mt-5 flex items-center mb-2">
            <FarmDetailsWarn />
            <p className="ml-1.5 text-gray-10 text-sm">
              Staking or unstaking will automatically claim your rewards.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface Lock {
  second: number;
  month: number;
  icon: any;
  multiplier: number;
}
