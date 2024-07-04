import React, { useEffect, useState } from "react";
import styles from "./poolRow.module.css";
import {
  formatPercentage,
  toInternationalCurrencySystem_usd,
  toInternationalCurrencySystem_number,
} from "@/utils/uiNumber";
import { useTokenMetadata } from "@/hooks/usePools";
import { NearIcon, NearIconMini } from "@/components/pools/icon";
import StablePoolRowCharts from "@/components/pools/stablePoolRowCharts/index";
import tokenIcons from "@/utils/tokenIconConfig";
import { useRouter } from "next/router";
import ShareNumber from "../detail/stable/ShareNumber";
import { formatePoolData } from "../detail/stable/FormatterPool";
import { useYourliquidity } from "@/hooks/useStableShares";
import PoolRowChild from "./poolRowChild";

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
    router.push(`/pool/stable/${item.id}`);
  };
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
    <div className="mb-2 min-h-90 overflow-y-auto overflow-x-hidden hover:cursor-pointer">
      {updatedMapList.map((item, index) => {
        return (
          <div key={item.id + index}>
            <PoolRowChild item={item} index={index}></PoolRowChild>
          </div>
        );
      })}
    </div>
  );
}
