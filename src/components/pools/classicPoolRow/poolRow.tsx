import React, { useEffect, useState } from "react";
import styles from "./poolRow.module.css";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import {
  formatPercentage,
  toInternationalCurrencySystem_usd,
  toInternationalCurrencySystem_number,
} from "@/utils/uiNumber";
import { useTokenMetadata, checkIsHighRisk } from "@/hooks/usePools";
import { NearIcon, DangerousIcon, TknIcon } from "@/components/pools/icon";
import { useRiskTokens } from "@/hooks/useRiskTokens";
import tokenIcons from "@/utils/tokenIconConfig";
import Tips from "@/components/common/Tips/index";
import { TokenIconComponent } from "@/components/pools/TokenIconWithTkn/index";

export default function PoolRow({
  list,
  loading,
}: {
  list: Array<any>;
  loading: boolean;
}) {
  const { isDealed, updatedMapList } = useTokenMetadata(list);
  const { pureIdList } = useRiskTokens();

  return (
    <div className="mb-2 max-h-90 overflow-auto">
      {loading || !isDealed ? (
        <SkeletonTheme
          baseColor="rgba(33, 43, 53, 0.3)"
          highlightColor="#2A3643"
        >
          <Skeleton width={1100} height={56} count={5} className="mt-4" />
        </SkeletonTheme>
      ) : (
        updatedMapList.map((item, index) => {
          return (
            <div
              key={item.id + "_" + index}
              className={`${styles.poolContainer} ${
                item.is_farm ? styles.isfarm : styles.notfarm
              }`}
            >
              {/* tokens */}
              <div className="flex items-center">
                {/*render token icon */}
                <div className={styles.tokenImgContainer}>
                  {item.token_account_ids.map((ite: any, ind: number) => (
                    <TokenIconComponent
                      key={ite.tokenId + ind}
                      ite={ite}
                      tokenIcons={tokenIcons}
                    />
                  ))}
                </div>
                {/*  */}
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
        })
      )}
    </div>
  );
}
