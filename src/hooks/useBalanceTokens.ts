import { useEffect, useState } from "react";
import { TokenMetadata } from "../services/ft-contract";
import { ftGetBalance } from "../services/token";
import { getTokenUIId } from "../services/swap/swapUtils";
import { useAccountStore } from "../stores/account";
import { toReadableNumber } from "@/utils/numbers";
import {
  useAccountTokenStore,
  IAccountTokenStore,
  useAccountBalanceTokenStore,
} from "../stores/token";

export interface ITokenMetadata extends TokenMetadata {
  balanceDecimal?: string;
  balance?: string;
}
export const useBalanceTokens = (
  tokens: TokenMetadata[],
  setBalancesLoading: (status: boolean) => void
) => {
  const [balanceTokens, setBalanceTokens] = useState<ITokenMetadata[]>([]);
  const accountStore = useAccountStore();
  const accountTokenStore = useAccountTokenStore() as IAccountTokenStore;
  const accountId = accountStore.getAccountId();
  const walletLoading = accountStore.getWalletLoading();
  const owner = accountTokenStore.getOwner();
  /* update cache logic (tokens with balances) start */
  useEffect(() => {
    if (tokens?.length > 0 && !walletLoading) {
      if (!accountId) {
        setBalancesLoading(false);
        setBalanceTokens(tokens);
      } else if (accountId !== owner) {
        setBalanceTokens(tokens);
        accountTokenStore.setOwner(accountId);
      } else {
        getBalanceTokens();
      }
    }
  }, [tokens?.length, accountId, walletLoading, owner]);
  /* update cache logic (tokens with balances) end */
  async function getBalanceTokens() {
    setBalancesLoading(true);
    const balancesPending = tokens.map((token: TokenMetadata) => {
      return ftGetBalance(getTokenUIId(token) == "near" ? "NEAR" : token.id);
    });
    const balances = await Promise.all(balancesPending);
    const tokensWithBalance = tokens.map((token: TokenMetadata, index) => {
      return {
        ...token,
        balanceDecimal: balances[index],
        balance: toReadableNumber(token.decimals, balances[index]),
      };
    }) as ITokenMetadata[];
    setBalanceTokens(tokensWithBalance);
    setBalancesLoading(false);
  }
  return balanceTokens;
};

export function useDefaultBalanceTokens(defaultList: TokenMetadata[]) {
  const [list, setList] = useState<ITokenMetadata[]>([]);
  const accountTokenStore = useAccountTokenStore() as IAccountTokenStore;
  const accountBalanceTokenStore = useAccountBalanceTokenStore();
  const defaultAccountBalancesStore =
    accountTokenStore.getDefaultAccountTokens();
  const defaultAccountBalancesServer = useBalanceTokens(
    defaultList,
    accountBalanceTokenStore.setDefaultBalancesLoading
  );
  useEffect(() => {
    if (defaultAccountBalancesStore.length > 0) {
      // get from cache
      setList(defaultAccountBalancesStore);
    }
    if (defaultAccountBalancesServer.length > 0) {
      // get from api and update cache
      setList(defaultAccountBalancesServer);
      accountTokenStore.setDefaultAccountTokens(defaultAccountBalancesServer);
    }
  }, [
    JSON.stringify(defaultAccountBalancesStore || []),
    JSON.stringify(defaultAccountBalancesServer || []),
  ]);
  return list;
}

export function useAutoBalanceTokens(autoList: TokenMetadata[]) {
  const [list, setList] = useState<ITokenMetadata[]>([]);
  const accountTokenStore = useAccountTokenStore() as IAccountTokenStore;
  const accountBalanceStore = useAccountBalanceTokenStore();
  const autoAccountBalancesStore = accountTokenStore.getAutoAccountTokens();
  const autoAccountBalancesServer = useBalanceTokens(
    autoList,
    accountBalanceStore.setAutoBalancesLoading
  );
  useEffect(() => {
    if (autoAccountBalancesStore.length > 0) {
      // get from cache
      setList(autoAccountBalancesStore);
    }
    if (autoAccountBalancesServer.length > 0) {
      // get from api and update cache
      setList(autoAccountBalancesServer);
      accountTokenStore.setAutoAccountTokens(autoAccountBalancesServer);
    }
  }, [
    JSON.stringify(autoAccountBalancesStore || []),
    JSON.stringify(autoAccountBalancesServer || []),
  ]);
  return list;
}
