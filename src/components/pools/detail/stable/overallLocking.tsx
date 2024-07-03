import React, { useEffect, useState, useMemo, use } from "react";
import {
  toInternationalCurrencySystem_usd,
  format_apy,
  formatPercentage,
} from "@/utils/uiNumber";
import {
  mft_has_registered,
  get_accounts_paged,
  ILock,
} from "@/services/lplock";
import getConfig from "@/utils/config";
import Big from "big.js";
import { useAccountStore } from "@/stores/account";
import { secToTime } from "@/utils/time";
import { getSharesInPool } from "@/services/pool";

export default function OverallLocking(props: any) {
  const { poolDetail, updatedMapList } = props;
  const detailItem = [
    {
      title: "TVL",
      value: "tvl",
    },
    {
      title: "Volume(24h)",
      value: "volume_24h",
    },
    {
      title: "Fee(24h)",
      value: "fee_volume_24h",
    },
    {
      title: "APR",
      value: "apy",
    },
  ];
  //
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const { REF_FI_CONTRACT_ID } = getConfig();
  const [isHidden, setIsHidden] = useState(true);
  const [is_mft_registered, set_is_mft_registered] = useState<boolean>(false);
  const [lp_locked_list, set_lp_locked_list] = useState<Record<string, ILock>>(
    {}
  );
  const [isLockedOpen, setIsLockedOpen] = useState<boolean>(false);
  const [isUnLockedOpen, setIsUnLockedOpen] = useState<boolean>(false);
  const [fold, setFold] = useState<boolean>(true);
  const [shares, setShares] = useState("");

  const [lockButtonDisabled, setLockButtonDisabled] = useState(true);
  const [unLockButtonDisabled, setUnLockButtonDisabled] = useState(true);
  //
  const [your_locked_percent, your_unLocked_time, your_locked_balance] =
    useMemo(() => {
      if (lp_locked_list[accountId]) {
        const { locked_balance, unlock_time_sec } = lp_locked_list[accountId];
        return [
          getSharesPercent(locked_balance),
          secToTime(unlock_time_sec),
          locked_balance,
        ];
      }
      return [{ percent: "", displayPercent: "" }, "", "0"];
    }, [accountId, lp_locked_list]);

  //
  const total_locked_percent = useMemo(() => {
    const totalLocked = Object.values(lp_locked_list).reduce((sum, cur) => {
      return sum.plus(cur.locked_balance);
    }, Big(0));
    return getSharesPercent(totalLocked.toFixed());
  }, [lp_locked_list]);

  //
  async function init() {
    const r = await mft_has_registered(`:${poolDetail?.id}`);
    set_is_mft_registered(r);
    if (r) {
      const locked_list: any[] = await get_accounts_paged();
      const locked_token_id = `${REF_FI_CONTRACT_ID}@:${poolDetail?.id}`;
      const current_lp_locked_list = locked_list.reduce((acc, cur) => {
        if (cur.locked_tokens[locked_token_id]) {
          return {
            ...acc,
            [cur.account_id]: {
              ...cur.locked_tokens[locked_token_id],
              token_id: locked_token_id,
            },
          };
        }
        return acc;
      }, {});
      set_lp_locked_list(current_lp_locked_list);
    }
  }

  function getSharesPercent(locked_balance: string) {
    const sharesInPool = poolDetail?.shares_total_supply;
    const sharesInLocked = locked_balance;
    let percent = "0";
    let displayPercent = "0%";
    if (Big(sharesInPool || "0").gt(0)) {
      percent = Big(sharesInLocked).div(sharesInPool).mul(100).toFixed();
      displayPercent = formatPercentage(percent);
    }
    return {
      percent,
      displayPercent,
    };
  }
  //
  useEffect(() => {
    init();
  }, [poolDetail]);

  useEffect(() => {
    if (shares) setLockButtonDisabled(Big(shares || 0).lte(0));
  }, [shares]);

  useEffect(() => {
    //
    getSharesInPool(+poolDetail?.id)
      .then(setShares)
      .catch(() => setShares);

    setUnLockButtonDisabled(
      Big(lp_locked_list?.[accountId]?.unlock_time_sec || 0).gte(
        new Date().getTime() / 1000
      ) || !your_unLocked_time
    );
  }, [lp_locked_list, your_unLocked_time, accountId]);

  function closeLockedModal() {
    setIsLockedOpen(false);
  }
  function openLockedModal() {
    if (!lockButtonDisabled) {
      setIsLockedOpen(true);
    }
  }
  function closeUnLockedModal() {
    setIsUnLockedOpen(false);
  }
  function openUnLockedModal() {
    if (!unLockButtonDisabled) {
      setIsUnLockedOpen(true);
    }
  }

  return (
    <div className="min-h-34">
      {poolDetail && (
        <div className="flex items-center justify-around">
          {detailItem.map((item) => {
            return (
              <div
                key={item.title}
                className="w-45 h-17 text-white box-border flex flex-col justify-center pl-4 rounded-md"
                style={{
                  backgroundColor: "rgba(33, 43, 53, 0.2)",
                }}
              >
                <h3 className="text-sm text-gray-50 font-normal">
                  {item.title}
                </h3>
                <p className="text-lg font-bold">
                  {item.value == "apy"
                    ? format_apy(poolDetail.apy)
                    : toInternationalCurrencySystem_usd(poolDetail[item.value])}
                  {/* farm apy */}
                  {item.value == "apy" && poolDetail.farm_apy && (
                    <span className="text-xs text-primaryGreen ml-2">
                      +{format_apy(poolDetail.farm_apy)}
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
