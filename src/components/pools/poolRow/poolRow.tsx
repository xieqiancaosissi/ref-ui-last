import React, { useEffect, useState } from "react";
import styles from "./poolRow.module.css";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import {
  formatPercentage,
  toInternationalCurrencySystem_usd,
  toInternationalCurrencySystem_number,
} from "@/utils/uiNumber";
import { useTokenMetadata } from "@/hooks/usePools";
import { NearIcon } from "@/components/pools/icon";

export default function PoolRow({
  list,
  loading,
}: {
  list: Array<any>;
  loading: boolean;
}) {
  const { isDealed, updatedMapList } = useTokenMetadata(list);
  console.log(list, "list>>>");
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
            <div key={item.id + "_" + index} className={styles.poolContainer}>
              {/* tokens */}
              <div className="flex items-center">
                <div className={styles.tokenImgContainer}>
                  {item.token_account_ids.map((ite: any, ind: number) => {
                    return ite.tokenId != "wrap.near" ? (
                      <img src={ite.icon} key={ite.tokenId + ind} />
                    ) : (
                      <NearIcon />
                    );
                  })}
                </div>
                <span className={styles.symbol}>
                  {item.token_symbols.join("-")}
                </span>
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
