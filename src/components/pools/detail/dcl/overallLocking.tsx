import React, { useEffect, useState, useMemo, use } from "react";
import {
  toInternationalCurrencySystem_usd,
  format_apy,
  formatPercentage,
} from "@/utils/uiNumber";
import styles from "./style.module.css";
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
    // {
    //   title: "APR",
    //   value: "apy",
    // },
  ];

  return (
    <div className="min-h-10">
      {poolDetail && (
        <div className="flex items-center justify-around">
          {detailItem.map((item, index) => {
            return (
              <div
                key={item.title}
                className={`flex-1 h-17 text-white box-border flex flex-col justify-center pl-4 rounded-md bg-refPublicBoxDarkBg ${
                  index == 1 ? "mx-1" : ""
                }`}
              >
                <h3 className="text-sm text-gray-50 font-normal">
                  {item.title}
                </h3>
                <p className="text-lg font-bold">
                  {toInternationalCurrencySystem_usd(poolDetail[item.value])}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
