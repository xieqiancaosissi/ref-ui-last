import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useDeepCompareEffect } from "react-use";
import { useSelectTokens } from "@/hooks/useSelectTokens";
import getConfigV2 from "@/utils/configV2";
import getConfig from "@/utils/config";
import { usePersistSwapStore, useSwapStore } from "@/stores/swap";
import {
  useDefaultBalanceTokens,
  useAutoBalanceTokens,
  ITokenMetadata,
} from "../../hooks/useBalanceTokens";
const configV2 = getConfigV2();
const config = getConfig();
const { INIT_SWAP_PAIRS } = configV2;
const { WRAP_NEAR_CONTRACT_ID } = config;
export default function InitData() {
  const { defaultList = [], autoList = [] } = useSelectTokens();
  const defaultDisplayTokens = useDefaultBalanceTokens(defaultList);
  const autoDisplayTokens = useAutoBalanceTokens(autoList);
  const totalDisplayTokens = [...defaultDisplayTokens, ...autoDisplayTokens];
  const persistSwapStore = usePersistSwapStore();
  const swapStore = useSwapStore();
  const tokenInIdStore = persistSwapStore.getTokenInId();
  const tokenOutIdStore = persistSwapStore.getTokenOutId();
  const [tokenInId, tokenOutId] = useMemo(() => {
    const tokenInId = getTokenId({
      idFromStore: tokenInIdStore,
      isIn: true,
    });
    const tokenOutId = getTokenId({
      idFromStore: tokenOutIdStore,
      isIn: false,
    });
    return [tokenInId, tokenOutId];
  }, [tokenInIdStore, tokenOutIdStore]);
  useEffect(() => {
    if (tokenInId && tokenOutId && totalDisplayTokens.length > 0) {
      const CHECKED_IN_TOKEN = gotTokenIdValidity(tokenInId, true);
      const CHECKED_OUT_TOKEN = gotTokenIdValidity(tokenOutId, false);
      swapStore.setTokenIn(CHECKED_IN_TOKEN);
      swapStore.setTokenOut(CHECKED_OUT_TOKEN);
      persistSwapStore.setTokenInId(CHECKED_IN_TOKEN.id);
      persistSwapStore.setTokenOutId(CHECKED_OUT_TOKEN.id);
    }
  }, [tokenInId, tokenOutId, totalDisplayTokens.length]);

  function getTokenId({
    idFromStore,
    isIn,
  }: {
    idFromStore: string;
    isIn: boolean;
  }) {
    const tokenId =
      idFromStore || (isIn ? INIT_SWAP_PAIRS[0] : INIT_SWAP_PAIRS[1]);
    return tokenId;
  }
  function gotTokenIdValidity(tokenId: string, isIn: boolean) {
    const nearToken = totalDisplayTokens.find(
      (token: ITokenMetadata) =>
        token.id === WRAP_NEAR_CONTRACT_ID && token.symbol == "NEAR"
    );
    const refToken = totalDisplayTokens.find(
      (token: ITokenMetadata) => token.id === INIT_SWAP_PAIRS[1]
    );
    if (tokenId == "near") {
      return nearToken as ITokenMetadata;
    } else {
      let token = totalDisplayTokens.find(
        (token: ITokenMetadata) => token.id === tokenId
      );
      if (!token) {
        token = isIn ? nearToken : refToken;
      }
      return token as ITokenMetadata;
    }
  }
  return null;
}
