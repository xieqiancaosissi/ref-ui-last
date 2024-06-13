import React from "react";
import styles from "./poolRow.module.css";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import {
  formatPercentage,
  toInternationalCurrencySystem_usd,
  toInternationalCurrencySystem_number,
} from "@/utils/uiNumber";

export default function PoolRow({
  list,
  loading,
}: {
  list: Array<any>;
  loading: boolean;
}) {
  console.log(list, "list>>");
  return (
    <div className="mb-2 max-h-90 overflow-auto">
      {loading ? (
        <SkeletonTheme
          baseColor="rgba(33, 43, 53, 0.3)"
          highlightColor="#2A3643"
        >
          <Skeleton width={1100} height={56} count={5} className="mt-4" />
        </SkeletonTheme>
      ) : (
        list.map((item, index) => {
          return (
            <div key={item.id + "_" + index} className={styles.poolContainer}>
              {/* tokens */}
              <div></div>
              <div>
                {/* fee */}
                <div>{formatPercentage(item.total_fee * 100)}</div>
                {/* apr */}
                <div>
                  <span>{formatPercentage(item.apy)}</span>
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
