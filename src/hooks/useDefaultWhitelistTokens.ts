import { useEffect, useState } from "react";
import { TokenMetadata } from "../services/ft-contract";
import { useTokenStore, useAccountTokenStore } from "../stores/token";
import { useAccountStore } from "../stores/account";
import {
  getGlobalWhitelist,
  getAccountWhitelist,
  ftGetTokenMetadata,
} from "../services/token";
export const useDefaultWhitelistTokens = () => {
  const [whiteListTokens, setWhiteListTokens] = useState<TokenMetadata[]>([]);
  const [globalWhitelistIds, setGlobalWhitelistIds] = useState<string[]>([]);
  const [accountWhitelistIds, setAccountWhitelistIds] = useState<string[]>([]);
  const tokenStore: any = useTokenStore();
  const accountTokenStore: any = useAccountTokenStore();
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const walletLoading = accountStore.walletLoading;
  useEffect(() => {
    getGlobalWhitelistTokens();
  }, []);
  useEffect(() => {
    if (accountId) {
      getAccountWhitelistTokens();
    }
    if (!walletLoading && !accountId) {
      clearAccountWhitelistTokens();
    }
  }, [accountId, walletLoading]);
  useEffect(() => {
    getWhitelistTokens();
  }, [globalWhitelistIds.length, accountWhitelistIds.length]);

  async function getWhitelistTokens() {
    const whiteTokenIds = [
      ...new Set([...globalWhitelistIds, ...accountWhitelistIds]),
    ];
    const tokens = await getTokenMetaDatas(whiteTokenIds, accountWhitelistIds);
    setWhiteListTokens(tokens);
  }
  async function getTokenMetaDatas(
    tokenIds: string[],
    accountWhitelistIds: string[]
  ) {
    const metadatas = await Promise.all(
      tokenIds.map((tokenId) => ftGetTokenMetadata(tokenId))
    );
    const tokens = metadatas.map((token: TokenMetadata) => {
      return {
        ...token,
        isDefaultWhiteToken: true,
        ...(accountWhitelistIds.includes(token.id)
          ? { isUserToken: true }
          : {}),
      };
    });
    return tokens;
  }
  async function getGlobalWhitelistTokens() {
    const storeList = tokenStore.get_whitelisted_tokens();
    getGlobalWhitelist().then((globalWhitelistIds) => {
      tokenStore.set_whitelisted_tokens(globalWhitelistIds);
      setGlobalWhitelistIds(globalWhitelistIds);
    });
    if (storeList.length > 0) {
      setGlobalWhitelistIds(storeList);
    }
  }
  async function getAccountWhitelistTokens() {
    const storeList = accountTokenStore.get_user_whitelisted_tokens();
    getAccountWhitelist().then((accountWhitelistIds) => {
      accountTokenStore.set_user_whitelisted_tokens(accountWhitelistIds);
      setAccountWhitelistIds(accountWhitelistIds);
    });
    setAccountWhitelistIds(storeList);
  }
  async function clearAccountWhitelistTokens() {
    accountTokenStore.set_user_whitelisted_tokens([]);
    setAccountWhitelistIds([]);
  }
  return whiteListTokens;
};
