import { useEffect, useState } from "react";
import { TokenMetadata } from "../services/ft-contract";
import {
  useTokenStore,
  useAccountTokenStore,
  ITokenStore,
  IAccountTokenStore,
} from "../stores/token";
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
  const tokenStore = useTokenStore() as ITokenStore;
  const accountTokenStore = useAccountTokenStore() as IAccountTokenStore;
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const walletLoading = accountStore.walletLoading;
  useEffect(() => {
    getGlobalWhitelistTokens();
  }, []);
  /* update cache logic (account whitelist) start */
  useEffect(() => {
    if (!walletLoading) {
      if (!accountId) {
        clearAccountWhitelistTokens();
      } else {
        getAccountWhitelistTokens();
      }
    }
  }, [accountId, walletLoading]);
  /* update cache logic (account whitelist) end */
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
        ...(accountWhitelistIds.includes(token.id)
          ? { isUserToken: true }
          : {}),
      };
    });
    return tokens;
  }
  async function getGlobalWhitelistTokens() {
    const storeList = tokenStore.get_global_whitelisted_tokens_ids();
    getGlobalWhitelist().then((globalWhitelistIds) => {
      tokenStore.set_global_whitelisted_tokens_ids(globalWhitelistIds);
      setGlobalWhitelistIds(globalWhitelistIds);
    });
    if (storeList?.length > 0) {
      setGlobalWhitelistIds(storeList);
    }
  }
  async function getAccountWhitelistTokens() {
    const storeList = accountTokenStore.get_user_whitelisted_tokens_ids();
    getAccountWhitelist().then((accountWhitelistIds) => {
      accountTokenStore.set_user_whitelisted_tokens_ids(accountWhitelistIds);
      setAccountWhitelistIds(accountWhitelistIds);
    });
    if (storeList?.length > 0) {
      setAccountWhitelistIds(storeList);
    }
  }
  async function clearAccountWhitelistTokens() {
    accountTokenStore.set_user_whitelisted_tokens_ids([]);
    setAccountWhitelistIds([]);
  }
  return whiteListTokens;
};
