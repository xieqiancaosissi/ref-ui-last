import React, { useEffect, useState } from "react";
import styles from "./poolRow.module.css";
import Router, { useRouter } from "next/router";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import {
  formatPercentage,
  toInternationalCurrencySystem_usd,
  toInternationalCurrencySystem_number,
} from "@/utils/uiNumber";
import { useTokenMetadata, checkIsHighRisk } from "@/hooks/usePools";
import { NearIcon, DangerousIcon } from "@/components/pools/icon";
import tokenIcons from "@/utils/tokenIconConfig";
import HoverTooltip from "@/components/common/HoverToolTip";
import { useWatchList } from "@/hooks/useWatchlist";
import { StartWatchList } from "@/components/pools/icon";

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
  const router = useRouter();
  const toDetail = (item: any) => {
    router.push(`/pool/dcl/${item.id}`);
  };
  const { currentwatchListId } = useWatchList();
  const [renderStarList, setRenderStarList] = useState<any>([]);
  useEffect(() => {
    if (currentwatchListId.length > 0) {
      setRenderStarList(currentwatchListId);
    }
  }, [currentwatchListId]);
  return (
    <div className="mb-2 min-h-90 overflow-auto hover:cursor-pointer xsm:w-full lg:w-276">
      {updatedMapList.map((item, index) => {
        return (
          <div
            key={item.id + "_" + index}
            className={`${styles.poolContainer} ${
              item.is_farm ? styles.isfarm : styles.notfarm
            }`}
            onClick={() => toDetail(item)}
          >
            {/* tokens */}
            <div className="flex items-center">
              <div className={styles.tokenImgContainer}>
                {item?.token_account_ids?.map((ite: any, ind: number) => {
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
              {/* is collect */}
              {renderStarList.includes(item.id.toString()) && (
                <StartWatchList className="mr-2" />
              )}
              {/* dangerous */}
              {checkIsHighRisk(pureIdList, item).risk && (
                <span className="mr-2 frcc">
                  <HoverTooltip
                    tooltipText={checkIsHighRisk(pureIdList, item).tips || ""}
                  >
                    <DangerousIcon />
                  </HoverTooltip>
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
