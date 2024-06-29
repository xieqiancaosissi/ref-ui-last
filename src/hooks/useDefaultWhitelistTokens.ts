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
  const [whitelistIdList, setWhitelistIdList] = useState<string[][]>([]);
  const tokenStore = useTokenStore() as ITokenStore;
  const accountTokenStore = useAccountTokenStore() as IAccountTokenStore;
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const walletLoading = accountStore.walletLoading;
  const owner = accountTokenStore.getOwner();
  useEffect(() => {
    setGlobalWhitelistTokenIds();
  }, []);
  useEffect(() => {
    // get white list ids from cache
    setWhitelistIdList(getWhiteListIdsFromCache());
    // get white list ids from server
    if (!walletLoading && globalWhitelistIds.length > 0) {
      getWhiteListIdsFromServer().then((idList) => {
        setWhitelistIdList(idList);
      });
    }
  }, [accountId, owner, walletLoading, globalWhitelistIds.length]);
  useEffect(() => {
    if (whitelistIdList.length > 0) {
      getWhitelistTokens();
    }
  }, [JSON.stringify(whitelistIdList || [])]);
  function getWhiteListIdsFromCache() {
    const whitelisted_tokens_ids =
      tokenStore.get_global_whitelisted_tokens_ids();
    const user_whitelisted_tokens_ids =
      accountTokenStore.get_user_whitelisted_tokens_ids();
    return [whitelisted_tokens_ids, user_whitelisted_tokens_ids || []];
  }
  async function getWhiteListIdsFromServer() {
    let accountWhitelistIds: string[] = [];
    /* update cache logic (account whitelist) start */
    if (!accountId || accountId !== owner) {
      clearAccountWhitelistTokenIds();
      /* update cache logic (account whitelist) end */
    } else {
      accountWhitelistIds = await getAccountWhitelistTokenIds();
    }
    return [globalWhitelistIds, accountWhitelistIds];
  }
  async function getWhitelistTokens() {
    const [globalWhitelistIds, accountWhitelistIds] = whitelistIdList;
    const whitelistIds = [
      ...new Set([...globalWhitelistIds, ...accountWhitelistIds]),
    ];
    const tokens = await getTokenMetaDatas(whitelistIds, accountWhitelistIds);
    setWhiteListTokens(tokens);
  }
  async function clearAccountWhitelistTokenIds() {
    accountTokenStore.set_user_whitelisted_tokens_ids([]);
    accountTokenStore.setOwner(accountId);
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
  async function setGlobalWhitelistTokenIds() {
    const globalWhitelist = await getGlobalWhitelist();
    const availableIds = globalWhitelist.filter(
      (id) => !HIDDEN_TOKEN_LIST.includes(id)
    );
    tokenStore.set_global_whitelisted_tokens_ids(availableIds);
    setGlobalWhitelistIds(availableIds);
  }
  async function getAccountWhitelistTokenIds() {
    const accountWhitelist = await getAccountWhitelist();
    accountTokenStore.set_user_whitelisted_tokens_ids(accountWhitelist);
    return accountWhitelist;
  }
  return whiteListTokens;
};
