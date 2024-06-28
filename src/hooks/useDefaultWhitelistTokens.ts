import { useEffect, useState } from "react";
import { TokenMetadata } from "../services/ft-contract";
import {
  useTokenStore,
  useAccountTokenStore,
  ITokenStore,
  IAccountTokenStore,
} from "../stores/token";
import { useAccountStore } from "../stores/account";
import getConfigV2 from "../utils/configV2";
import {
  getGlobalWhitelist,
  getAccountWhitelist,
  ftGetTokenMetadata,
} from "../services/token";
const configV2 = getConfigV2();
const { HIDDEN_TOKEN_LIST } = configV2;
export const useDefaultWhitelistTokens = () => {
  const [whiteListTokens, setWhiteListTokens] = useState<TokenMetadata[]>([]);
  const [globalWhitelistIds, setGlobalWhitelistIds] = useState<string[]>([]);
  const [accountWhitelistIds, setAccountWhitelistIds] = useState<string[]>([]);
  const tokenStore = useTokenStore() as ITokenStore;
  const accountTokenStore = useAccountTokenStore() as IAccountTokenStore;
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const walletLoading = accountStore.walletLoading;
  const owner = accountTokenStore.getOwner();
  useEffect(() => {
    getGlobalWhitelistTokens();
  }, []);
  /* update cache logic (account whitelist) start */
  useEffect(() => {
    if (!walletLoading) {
      if (!accountId || accountId !== owner) {
        clearAccountWhitelistTokens();
      } else {
        getAccountWhitelistTokenIds();
      }
    }
  }, [accountId, owner, walletLoading]);
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
    const metadatas = (
      await Promise.all(tokenIds.map((tokenId) => ftGetTokenMetadata(tokenId)))
    ).filter((_) => _);
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
      const availableIds = globalWhitelistIds.filter(
        (id) => !HIDDEN_TOKEN_LIST.includes(id)
      );
      tokenStore.set_global_whitelisted_tokens_ids(availableIds);
      setGlobalWhitelistIds(availableIds);
    });
    if (storeList?.length > 0) {
      setGlobalWhitelistIds(storeList);
    }
  }
  async function getAccountWhitelistTokenIds() {
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
    accountTokenStore.setOwner(accountId);
    setAccountWhitelistIds([]);
  }
  return whiteListTokens;
};
