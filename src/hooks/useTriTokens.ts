import React, { useState, useEffect } from "react";
import { TokenMetadata } from "@/services/ft-contract";
import { ftGetTokenMetadata } from "@/services/token";
import { getAuroraConfig, defaultTokenList } from "@/utils/auroraConfig";
import { getBatchTokenNearAcounts } from "@/services/aurora";

export const useTriTokens = (stopOn?: boolean) => {
  const [triTokens, setTriTokens] = useState<TokenMetadata[]>();
  const auroraTokens = defaultTokenList.tokens;
  const allSupportPairs = getAuroraConfig().Pairs;
  const symbolToAddress: any = auroraTokens.reduce((pre, cur, i) => {
    return {
      ...pre,
      [cur.symbol]: cur.address,
    };
  }, {});

  const tokenIds = Object.keys(allSupportPairs)
    .map((pairName: string) => {
      const names = pairName.split("-");
      return names.map((n) => {
        if (n === "ETH") return getAuroraConfig().WETH;
        else return symbolToAddress[n];
      });
    })
    .flat();
  useEffect(() => {
    if (stopOn) return;
    getBatchTokenNearAcounts(tokenIds).then((res) => {
      const allIds = res.concat(["aurora"]);

      return Promise.all(
        allIds.map((addr: string) =>
          ftGetTokenMetadata(addr).then((ftmeta) => ({
            ...ftmeta,
            onTri: true,
          }))
        )
      ).then(setTriTokens);
    });
  }, [stopOn]);
  return !!stopOn ? [] : triTokens?.filter((token) => token.id);
};
