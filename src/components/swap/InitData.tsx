import { useEffect } from "react";
import getConfigV2 from "@/utils/configV2";
import { usePersistSwapStore, useSwapStore } from "@/stores/swap";
import { useTokenStore, ITokenStore } from "@/stores/token";
import { useAccountStore } from "@/stores/account";
import useAllWhiteTokensWithBalances from "@/hooks/useAllWhiteTokensWithBalances";
import { setSwapTokenAndBalances } from "@/components/common/SelectTokenModal/tokenUtils";
const configV2 = getConfigV2();
const { INIT_SWAP_PAIRS } = configV2;
export default function InitData() {
  const {
    defaultAccountTokensHook,
    tknAccountTokensHook,
    tknxAccountTokensHook,
    mcAccountTokensHook,
  } = useAllWhiteTokensWithBalances();
  const persistSwapStore = usePersistSwapStore();
  const swapStore = useSwapStore();
  const tokenStore = useTokenStore() as ITokenStore;
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const walletLoading = accountStore.getWalletLoading();
  useEffect(() => {
    if (!walletLoading) {
      const tokenInIdStore = persistSwapStore.getTokenInId();
      const tokenOutIdStore = persistSwapStore.getTokenOutId();
      const tokenInId = getTokenId({
        idFromStore: tokenInIdStore,
        isIn: true,
      });
      const tokenOutId = getTokenId({
        idFromStore: tokenOutIdStore,
        isIn: false,
      });
      setSwapTokenAndBalances({
        tokenInId,
        tokenOutId,
        accountId,
        swapStore,
        persistSwapStore,
        tokenStore,
      });
    }
  }, [walletLoading, accountId]);
  useEffect(() => {
    tokenStore.setDefaultAccountTokens(defaultAccountTokensHook || {});
  }, [JSON.stringify(defaultAccountTokensHook || {})]);
  useEffect(() => {
    tokenStore.setTknAccountTokens(tknAccountTokensHook || {});
  }, [JSON.stringify(tknAccountTokensHook || {})]);
  useEffect(() => {
    tokenStore.setTknxAccountTokens(tknxAccountTokensHook || {});
  }, [JSON.stringify(tknxAccountTokensHook || {})]);
  useEffect(() => {
    tokenStore.setMcAccountTokens(mcAccountTokensHook || {});
  }, [JSON.stringify(mcAccountTokensHook || {})]);
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
  return null;
}
