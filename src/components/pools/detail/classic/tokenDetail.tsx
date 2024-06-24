import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import tokenIcons from "@/utils/tokenIconConfig";
import { getPoolsDetailById } from "@/services/pool";
import { TokenIconComponent } from "@/components/pools/TokenIconWithTkn/index";
import { useRiskTokens } from "@/hooks/useRiskTokens";
import { useTokenMetadata } from "@/hooks/usePools";
import styles from "./style.module.css";

export default function TokenDetail(poolDetail: any) {
  const { updatedMapList } = useTokenMetadata([poolDetail]);
  const { pureIdList } = useRiskTokens();

  return (
    <div>
      {updatedMapList.map((item, index) => {
        return (
          <div
            className={styles.tokenImgContainer}
            key={"poolTokendetail_" + index}
          >
            {item.token_account_ids.map((ite: any, ind: number) => (
              <TokenIconComponent
                key={ite.tokenId + ind}
                ite={ite}
                tokenIcons={tokenIcons}
                pureIdList={pureIdList}
                ind={ind}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
