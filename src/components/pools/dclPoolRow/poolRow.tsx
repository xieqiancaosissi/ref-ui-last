import React, { useEffect, useState } from "react";
import styles from "./poolRow.module.css";
import {
  formatPercentage,
  toInternationalCurrencySystem_usd,
  toInternationalCurrencySystem_number,
} from "@/utils/uiNumber";
import { useTokenMetadata, checkIsHighRisk } from "@/hooks/usePools";
import { NearIcon, DangerousIcon } from "@/components/pools/icon";
import tokenIcons from "@/utils/tokenIconConfig";
import Tips from "@/components/common/Tips/index";

export default function PoolRow({
  list,
  loading,
  pureIdList,
}: {
  list: Array<any>;
  loading: boolean;
  pureIdList: any;
}) {
  const { isDealed, updatedMapList } = useTokenMetadata(list);

  return (
    <div className="mb-2 h-90 overflow-auto">
      {updatedMapList.map((item, index) => {
        return (
          <div
            key={item.id + "_" + index}
            className={`${styles.poolContainer} ${
              item.is_farm ? styles.isfarm : styles.notfarm
            }`}
          >
            {/* tokens */}
            <div className="flex items-center">
              <div className={styles.tokenImgContainer}>
                {item.token_account_ids.map((ite: any, ind: number) => {
                  // if tokenid in tokenIcons
                  return Reflect.has(tokenIcons, ite.tokenId) ? (
                    // if token is near use new icon
                    ite.tokenId != "wrap.near" ? (
                      <img
                        src={tokenIcons[ite.tokenId]}
                        key={ite.tokenId + ind}
                      />
                    ) : (
                      <NearIcon />
                    )
                  ) : (
                    <img src={ite.icon} key={ite.tokenId + ind} />
                  );
                })}
              </div>
              <span className={styles.symbol}>
                {item.token_symbols.join("-")}
              </span>
              {/* dangerous */}
              {checkIsHighRisk(pureIdList, item).risk && (
                <span className="mr-1">
                  <Tips
                    msg={checkIsHighRisk(pureIdList, item).tips || ""}
                    extraStyles={"w-50"}
                    OhterIcon={DangerousIcon}
                  />
                </span>
              )}
              {/* tag */}
              {item.is_farm && (
                <div
                  className={` bg-farmTagBg text-farmApyColor ${styles.tagPublicStyle}`}
                >
                  Farms
                </div>
              )}
              {item.is_new && (
                <div
                  className={`bg-primaryGreen text-black ${styles.tagPublicStyle}`}
                >
                  News
                </div>
              )}
            </div>
            <div>
              {/* fee */}
              <div>{formatPercentage(item.total_fee * 100)}</div>
              {/* apr */}
              <div>
                <span>{formatPercentage(item.apy)}</span>
                {item.farm_apy > 0 && (
                  <span className="text-farmApyColor text-xs mt-1">
                    +{formatPercentage(item.farm_apy)}
                  </span>
                )}
              </div>
              {/* 24h */}
              <div>{toInternationalCurrencySystem_usd(item.volume_24h)}</div>
              {/* tvl */}
              <div>{toInternationalCurrencySystem_number(item.tvl)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
