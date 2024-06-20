import React, { useEffect, useState } from "react";
import styles from "./poolRow.module.css";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import {
  formatPercentage,
  toInternationalCurrencySystem_usd,
  toInternationalCurrencySystem_number,
} from "@/utils/uiNumber";
import { useTokenMetadata } from "@/hooks/usePools";
import { NearIcon, NearIconMini } from "@/components/pools/icon";
import { useRiskTokens } from "@/hooks/useRiskTokens";
import StablePoolRowCharts from "@/components/pools/stablePoolRowCharts/index";
import tokenIcons from "@/utils/tokenIconConfig";

export default function PoolRow({
  list,
  loading,
}: {
  list: Array<any>;
  loading: boolean;
}) {
  const { isDealed, updatedMapList } = useTokenMetadata(list);
  const { pureIdList } = useRiskTokens();
  const [legendJson, setLegendJson] = useState<any>({
    item: null,
    ind: 0,
    index: 0,
  });
  const legendMouseEnter = (id: any, ind: number, index: number) => {
    setLegendJson({
      id,
      index,
      ind,
    });
  };

  return (
    <div className="mb-2 max-h-90 overflow-y-auto overflow-x-hidden">
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
              {/* pools---first child */}
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

              {/* last child */}
              <div className={styles.poolLast}>
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
                <div>
                  <div>{toInternationalCurrencySystem_number(item.tvl)}</div>

                  {/* tvl token amounts */}
                  <div className={styles.tokenCharts}>
                    {item.token_account_ids.map((ite: any, ind: number) => {
                      return (
                        <div
                          key={ite + ind}
                          className="flex my-1 rounded-xl cursor-pointer border border-transparent hover:border-chartsPink"
                          style={{
                            padding: "1px 2px 1px 2px",
                          }}
                          onMouseEnter={() =>
                            legendMouseEnter(item.id, ind, index)
                          }
                          onMouseLeave={() => {
                            legendMouseEnter(null, 0, 0);
                          }}
                        >
                          {/* token images */}
                          {ite.tokenId != "wrap.near" ? (
                            <img
                              src={ite.icon}
                              key={ite.tokenId + ind}
                              className="w-4 h-4 rounded-full flex-shrink-0"
                            />
                          ) : (
                            <NearIconMini className="flex-shrink-0" />
                          )}
                          {/* token name */}
                          <span className="ml-1">
                            {toInternationalCurrencySystem_number(
                              item.amounts[ind].substring(
                                0,
                                item.amounts[ind].length - ite.decimals
                              )
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* pie charts */}
                <div className={styles.stableCharts}>
                  <StablePoolRowCharts
                    jsonMap={item}
                    legendJson={legendJson}
                    highlight={legendJson.id === item.id}
                  />
                </div>
              </div>

              {/* hide farm div */}
              <div className={styles.farmContainer}>
                <div>
                  <div>Shares: 0%</div>
                  <div className="frcc">
                    <div className={`${styles.btnStyle} ${styles.lightBtn}`}>
                      Add
                    </div>
                    <div className={`${styles.btnStyle} ${styles.darkBtn}`}>
                      Remove
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
