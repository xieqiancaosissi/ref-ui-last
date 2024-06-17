import { useEffect, useState } from "react";
import { TokenMetadata } from "../services/ft-contract";
import { ftGetBalance } from "../services/token";
import { useAccountStore } from "../stores/account";
import { toReadableNumber } from "@/utils/numbers";
import { useAccountTokenStore } from "../stores/token";

export interface ITokenMetadata extends TokenMetadata {
  balanceDecimal?: string;
  balance?: string;
}
export const useBalanceTokens = (tokens: TokenMetadata[]) => {
  const [balanceTokens, setBalanceTokens] = useState<ITokenMetadata[]>([]);
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const walletLoading = accountStore.walletLoading;
  useEffect(() => {
    if (tokens.length > 0 && !walletLoading) {
      if (accountId) {
        getBalanceTokens();
      } else {
        setBalanceTokens(tokens);
      }
    }
  }, [tokens.length, accountId, walletLoading]);
  async function getBalanceTokens() {
    const balancesPending = tokens.map((token: TokenMetadata) => {
      return ftGetBalance(token.symbol == "NEAR" ? "NEAR" : token.id);
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
  }
  return balanceTokens;
};

export function useDefaultBalanceTokens(defaultList: TokenMetadata[]) {
  const [list, setList] = useState<ITokenMetadata[]>([]);
  const accountTokenStore: any = useAccountTokenStore();
  const defaultAccountBalancesStore =
    accountTokenStore.getDefaultAccountBalances();
  const defaultAccountBalancesServer = useBalanceTokens(defaultList);
  useEffect(() => {
    if (defaultAccountBalancesStore.length > 0) {
      setList(defaultAccountBalancesStore);
    }
    if (defaultAccountBalancesServer.length > 0) {
      setList(defaultAccountBalancesServer);
      accountTokenStore.setDefaultAccountBalances(defaultAccountBalancesServer);
    }
  }, [defaultAccountBalancesStore.length, defaultAccountBalancesServer.length]);
  return list;
}

export function useAutoBalanceTokens(autoList: TokenMetadata[]) {
  const [list, setList] = useState<ITokenMetadata[]>([]);
  const accountTokenStore: any = useAccountTokenStore();
  const autoAccountBalancesStore = accountTokenStore.getAutoAccountBalances();
  const autoAccountBalancesServer = useBalanceTokens(autoList);
  useEffect(() => {
    if (autoAccountBalancesStore.length > 0) {
      setList(autoAccountBalancesStore);
    }
    if (autoAccountBalancesServer.length > 0) {
      setList(autoAccountBalancesServer);
      accountTokenStore.setAutoAccountBalances(autoAccountBalancesServer);
    }
  }, [autoAccountBalancesStore.length, autoAccountBalancesServer.length]);
  return list;
}
