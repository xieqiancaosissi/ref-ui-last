import { useEffect, useMemo } from "react";
import { useSelectTokens } from "@/hooks/useSelectTokens";
import getConfigV2 from "@/utils/configV2";
import { usePersistSwapStore, useSwapStore } from "@/stores/swap";
import { getTokenUIId } from "@/services/swap/swapUtils";
import {
  useDefaultBalanceTokens,
  useAutoBalanceTokens,
  ITokenMetadata,
} from "../../hooks/useBalanceTokens";
const configV2 = getConfigV2();
const { INIT_SWAP_PAIRS } = configV2;
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
      persistSwapStore.setTokenInId(getTokenUIId(CHECKED_IN_TOKEN));
      persistSwapStore.setTokenOutId(getTokenUIId(CHECKED_OUT_TOKEN));
    }
  }, [tokenInId, tokenOutId, JSON.stringify(totalDisplayTokens || [])]);

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
      (token: ITokenMetadata) => getTokenUIId(token) == "near"
    );
    const refToken = totalDisplayTokens.find(
      (token: ITokenMetadata) => token.id === INIT_SWAP_PAIRS[1]
    );
    if (tokenId == "near") {
      return nearToken as ITokenMetadata;
    } else {
      let token = totalDisplayTokens.find(
        (token: ITokenMetadata) =>
          token.id === tokenId && token.symbol !== "NEAR"
      );
      if (!token) {
        token = isIn ? nearToken : refToken;
      }
      return token as ITokenMetadata;
    }
  }
  return null;
}
