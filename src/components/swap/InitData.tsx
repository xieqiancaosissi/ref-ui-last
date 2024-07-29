import { useEffect, useMemo } from "react";
import getConfigV2 from "@/utils/configV2";
import { usePersistSwapStore, useSwapStore } from "@/stores/swap";
import { useTokenStore, ITokenStore } from "@/stores/token";
import { useAccountStore } from "@/stores/account";
import useAllWhiteTokensWithBalances from "@/hooks/useAllWhiteTokensWithBalances";
import { getTokenBalance, ftGetTokenMetadata } from "@/services/token";
import { toReadableNumber } from "@/utils/numbers";
import { getTokenUIId } from "@/services/swap/swapUtils";
import { ITokenMetadata } from "@/interfaces/tokens";
const configV2 = getConfigV2();
const { INIT_SWAP_PAIRS } = configV2;
export default function InitData() {
  const { defaultAccountTokens, autoAccountTokens, done } =
    useAllWhiteTokensWithBalances();
  const persistSwapStore = usePersistSwapStore();
  const swapStore = useSwapStore();
  const tokenStore = useTokenStore() as ITokenStore;
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const walletLoading = accountStore.getWalletLoading();
  useEffect(() => {
    if (done) {
      tokenStore.setDefaultAccountTokens(defaultAccountTokens);
      tokenStore.setAutoAccountTokens(autoAccountTokens);
    }
  }, [
    done,
    JSON.stringify(defaultAccountTokens || []),
    JSON.stringify(autoAccountTokens || []),
  ]);
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
      getTokensWithBalance(tokenInId, tokenOutId);
    }
  }, [walletLoading, accountId]);
  async function getTokensWithBalance(tokenInId: string, tokenOutId: string) {
    let TOKEN_IN, TOKEN_OUT;
    const in_meta_pending = ftGetTokenMetadata(tokenInId, true);
    const out_meta_pending = ftGetTokenMetadata(tokenOutId, true);
    const metas = await Promise.all([in_meta_pending, out_meta_pending]);
    if (accountId) {
      swapStore.setBalanceLoading(true);
      const in_pending = getTokenBalance(
        tokenInId == "near" ? "NEAR" : tokenInId
      );
      const out_pending = getTokenBalance(
        tokenOutId == "near" ? "NEAR" : tokenOutId
      );
      const balances = await Promise.all([in_pending, out_pending]);
      TOKEN_IN = {
        ...metas[0],
        balanceDecimal: balances[0],
        balance: toReadableNumber(metas[0].decimals, balances[0]),
      };
      TOKEN_OUT = {
        ...metas[1],
        balanceDecimal: balances[1],
        balance: toReadableNumber(metas[1].decimals, balances[1]),
      };
      updateStoreBalance(TOKEN_IN, TOKEN_OUT);
    } else {
      TOKEN_IN = metas[0];
      TOKEN_OUT = metas[1];
    }
    swapStore.setTokenIn(TOKEN_IN);
    swapStore.setTokenOut(TOKEN_OUT);
    persistSwapStore.setTokenInId(getTokenUIId(TOKEN_IN));
    persistSwapStore.setTokenOutId(getTokenUIId(TOKEN_OUT));
    swapStore.setBalanceLoading(false);
  }
  function updateStoreBalance(
    token_in: ITokenMetadata,
    token_out: ITokenMetadata
  ) {
    const defaultAccountTokens = tokenStore.getDefaultAccountTokens();
    const autoAccountTokens = tokenStore.getAutoAccountTokens();
    const index_in_default = defaultAccountTokens.findIndex(
      (t) => t.id == token_in.id && t.symbol == token_in.symbol
    );
    if (index_in_default > 0) {
      defaultAccountTokens[index_in_default] = token_in;
    } else {
      const index_in_auto = autoAccountTokens.findIndex(
        (t) => t.id == token_in.id && t.symbol == token_in.symbol
      );
      if (index_in_auto > 0) {
        autoAccountTokens[index_in_auto] = token_in;
      }
    }
    const index_out_default = defaultAccountTokens.findIndex(
      (t) => t.id == token_out.id && t.symbol == token_out.symbol
    );
    if (index_out_default > 0) {
      defaultAccountTokens[index_out_default] = token_out;
    } else {
      const index_out_auto = autoAccountTokens.findIndex(
        (t) => t.id == token_out.id && t.symbol == token_out.symbol
      );
      if (index_out_auto > 0) {
        autoAccountTokens[index_out_auto] = token_out;
      }
    }
    tokenStore.setDefaultAccountTokens(defaultAccountTokens);
    tokenStore.setAutoAccountTokens(autoAccountTokens);
  }
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
