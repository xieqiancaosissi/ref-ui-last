import { Seed, BoostConfig, UserSeedInfo } from "@/services/farm";
import { useState } from "react";
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
import Alert from "@/components/alert/Alert";

const {
  STABLE_POOL_IDS,
  FARM_LOCK_SWITCH,
  REF_VE_CONTRACT_ID,
  FARM_BLACK_LIST_V2,
} = getConfig();
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
  const freeAmount = toReadableNumber(DECIMALS, free_amount);
  const lockedAmount = toReadableNumber(DECIMALS, locked_amount);
  const [amount, setAmount] = useState(
    stakeType == "freeToLock" ? freeAmount : ""
  );
  const [activeTab, setActiveTab] = useState("Stake");
  const [amountAvailableCheck, setAmountAvailableCheck] = useState(true);
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
  return (
    <div className="bg-dark-10 rounded-md p-5 mb-2.5 h-full">
      <div className="flex items-center mb-4">
        <button
          className={`text-lg pr-5 ${
            activeTab === "Stake" ? styles.gradient_text : "text-gray-500"
          }`}
          onClick={() => setActiveTab("Stake")}
        >
          Stake
        </button>
        <div className="h-4 bg-gray-50" style={{ width: "2px" }} />
        <button
          className={`text-lg pl-5 ${
            activeTab === "Unstake" ? styles.gradient_text : "text-gray-500"
          }`}
          onClick={() => setActiveTab("Unstake")}
        >
          Unstake
        </button>
      </div>
      {activeTab === "Stake" && (
        <div>
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
                  changeAmount(
                    stakeType == "freeToLock" ? freeAmount : lpBalance
                  );
                }}
                className={`text-sm text-gray-50 underline cursor-pointer hover:text-primaryGreen`}
              >
                Max
              </span>
            </div>
          </div>
          {amountAvailableCheck ? null : (
            <div className="flex justify-center mt-2">
              <Alert
                level="warn"
                message={
                  "Input must be greater than or equal to '" +
                  toReadableNumber(DECIMALS, min_deposit)
                }
              />
            </div>
          )}
          <div className="mt-2.5 text-sm mb-6">
            {displayLpBalance()}
            <span className="text-gray-10 ml-1">available to stake</span>
          </div>
        </div>
      )}

      {activeTab === "Unstake" && (
        <div>
          <h2 className="text-xl mb-4">Unstake your tokens</h2>
        </div>
      )}
    </div>
  );
}
