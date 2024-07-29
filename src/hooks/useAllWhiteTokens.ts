import { useEffect, useState } from "react";
import { TokenMetadata } from "../services/ft-contract";
import getConfigV2 from "../utils/configV2";
import { useTokenStore, ITokenStore } from "../stores/token";
import { get_auto_whitelisted_postfix_list } from "../services/token";
import {
  getGlobalWhitelist,
  getAccountWhitelist,
  ftGetTokenMetadata,
} from "../services/token";
import { useAccountStore } from "../stores/account";
import db from "../db/RefDatabase";
import { getTokens } from "../services/indexer";
import { getWnearToken } from "@/services/swap/swapUtils";
import {
  IGlobalWhitelistData,
  IAccountWhitelistData,
  IListTokensData,
  IPostfixData,
  ISelectTokens,
} from "@/interfaces/tokens";
import { getTokenUIId } from "@/services/swap/swapUtils";
const { HIDDEN_TOKEN_LIST } = getConfigV2();

const useAllWhiteTokens = () => {
  const [globalWhitelistData, setGlobalWhitelistData] =
    useState<IGlobalWhitelistData>({
      globalWhitelist: [],
      done: false,
    });
  const [accountWhitelistData, setAccountWhitelistData] =
    useState<IAccountWhitelistData>({
      accountWhitelist: [],
      done: false,
    });
  const [postfixData, setPostfixData] = useState<IPostfixData>({
    postfix: [],
    done: false,
  });
  const [listTokensData, setListTokensData] = useState<IListTokensData>({
    listTokens: [],
    done: false,
  });
  const initSelectTokensData = {
    defaultList: [],
    autoList: [],
    totalList: [],
    done: false,
  };
  const [selectTokens, setSelectTokens] =
    useState<ISelectTokens>(initSelectTokensData);
  const tokenStore = useTokenStore() as ITokenStore;
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const walletLoading = accountStore.getWalletLoading();
  const owner = tokenStore.getOwner();
  const global_whitelisted_tokens_ids =
    tokenStore.get_global_whitelisted_tokens_ids();
  const user_whitelisted_tokens_ids =
    tokenStore.get_user_whitelisted_tokens_ids();
  const auto_whitelisted_postfix = tokenStore.get_auto_whitelisted_postfix();
  const isCached = checkCache();
  useEffect(() => {
    getGlobalWhitelistTokenIds();
    getAutoWhitelistedPostfix();
    getAllTokens();
  }, []);
  useEffect(() => {
    if (!walletLoading) {
      getAccountWhitelistTokenIds();
    }
  }, [accountId, walletLoading]);
  useEffect(() => {
    if (!walletLoading) {
      if (owner == accountId && isCached) {
        // get data from cache
        getSelectTokensFromCache();
        // update cache
        getSelectTokensFromServer();
      } else {
        // get data from cache and update cache
        getSelectTokensFromServer();
      }
    }
  }, [
    accountId,
    walletLoading,
    owner,
    isCached,
    globalWhitelistData.done,
    accountWhitelistData.done,
    postfixData.done,
    listTokensData.done,
    JSON.stringify(global_whitelisted_tokens_ids || []),
    JSON.stringify(user_whitelisted_tokens_ids || []),
    JSON.stringify(auto_whitelisted_postfix || []),
  ]);
  async function getSelectTokensFromServer() {
    if (
      !(
        globalWhitelistData.done &&
        accountWhitelistData.done &&
        postfixData.done &&
        listTokensData.done
      )
    )
      return initSelectTokensData;
    tokenStore.setOwner(accountId || "");
    const defaultWhitelistIds = [
      ...new Set([
        ...globalWhitelistData.globalWhitelist,
        ...accountWhitelistData.accountWhitelist,
      ]),
    ];
    const defaultWhiteTokens = await getTokenMetaDatas(defaultWhitelistIds);
    const wnearToken = getWnearToken(defaultWhiteTokens);
    if (wnearToken) {
      defaultWhiteTokens.push(wnearToken);
    }
    const white_list_token_map: Record<string, TokenMetadata> =
      defaultWhiteTokens.reduce((sum, cur) => {
        return { ...sum, [cur.id]: cur };
      }, {});

    const auto_whitelisted_tokens = listTokensData.listTokens.filter(
      (token: TokenMetadata) =>
        postfixData.postfix?.some((p) => token.id.includes(p)) &&
        !white_list_token_map[token.id]
    );
    const defaultTokens = defaultWhiteTokens
      .map((token) => {
        if (
          !globalWhitelistData.globalWhitelist.includes(token.id) &&
          postfixData.postfix?.some((p) => token.id.includes(p))
        ) {
          return {
            ...token,
            isRisk: true,
          };
        }
        return token;
      })
      .filter((token) => !HIDDEN_TOKEN_LIST.includes(token.id));
    const autoTokens = auto_whitelisted_tokens
      .map((token) => {
        return {
          ...token,
          isRisk: true,
        };
      })
      .filter((token) => !HIDDEN_TOKEN_LIST.includes(token.id));
    // init common tokens
    initCommonTokens(defaultTokens);
    const reault = {
      defaultList: defaultTokens,
      autoList: autoTokens,
      totalList: [...defaultTokens, ...autoTokens],
      done: true,
    };
    setSelectTokens(reault);
    return reault;
  }
  async function getTokenMetaDatas(tokenIds: string[]) {
    const metadatas = (
      await Promise.all(tokenIds.map((tokenId) => ftGetTokenMetadata(tokenId)))
    ).filter((_) => _);
    return metadatas;
  }
  async function getGlobalWhitelistTokenIds() {
    const globalWhitelist = await getGlobalWhitelist();
    setGlobalWhitelistData({
      globalWhitelist,
      done: true,
    });
    tokenStore.set_global_whitelisted_tokens_ids(globalWhitelist);
  }
  async function getAccountWhitelistTokenIds() {
    if (accountId) {
      const accountWhitelist = await getAccountWhitelist();
      setAccountWhitelistData({
        accountWhitelist,
        done: true,
      });
      tokenStore.set_user_whitelisted_tokens_ids(accountWhitelist);
    } else {
      setAccountWhitelistData({
        accountWhitelist: [],
        done: true,
      });
      tokenStore.set_user_whitelisted_tokens_ids([]);
    }
  }
  async function getAutoWhitelistedPostfix() {
    const postfixList = await get_auto_whitelisted_postfix_list();
    setPostfixData({
      postfix: postfixList || [],
      done: true,
    });
    tokenStore.set_auto_whitelisted_postfix(postfixList || []);
  }
  async function getAllTokens() {
    let allTokens = (await db.queryAllTokens()) || [];
    if (!allTokens.length) {
      const tokens = await getTokens();
      allTokens = Object.keys(tokens).reduce((acc, id) => {
        // @ts-ignore
        acc.push({
          id,
          ...tokens[id],
        });
        return acc;
      }, []);
    }
    setListTokensData({
      listTokens: allTokens,
      done: true,
    });
  }
  async function getSelectTokensFromCache() {
    const defaultWhitelistIds = [
      ...new Set([
        ...global_whitelisted_tokens_ids,
        ...user_whitelisted_tokens_ids,
      ]),
    ];
    const defaultWhiteTokens = await getTokenMetaDatas(defaultWhitelistIds);
    const white_list_token_map: Record<string, TokenMetadata> =
      defaultWhiteTokens.reduce((sum, cur) => {
        return { ...sum, [cur.id]: cur };
      }, {});

    const auto_whitelisted_tokens = listTokensData.listTokens.filter(
      (token: TokenMetadata) =>
        auto_whitelisted_postfix?.some((p) => token.id.includes(p)) &&
        !white_list_token_map[token.id]
    );
    setSelectTokens({
      defaultList: defaultWhiteTokens,
      autoList: auto_whitelisted_tokens,
      totalList: [...defaultWhiteTokens, ...auto_whitelisted_tokens],
      done: true,
    });
  }
  function initCommonTokens(defaultTokens: TokenMetadata[]) {
    // init common tokens
    if (
      tokenStore.get_common_tokens().length === 0 &&
      !tokenStore.get_common_tokens_is_edited()
    ) {
      const { INIT_COMMON_TOKEN_IDS } = getConfigV2();
      const init_common_tokens = defaultTokens.filter(
        (token) =>
          getTokenUIId(token) == "near" ||
          INIT_COMMON_TOKEN_IDS.includes(token.id)
      );
      tokenStore.set_common_tokens(init_common_tokens);
    }
  }
  function checkCache() {
    return !!global_whitelisted_tokens_ids.length;
  }

  return selectTokens;
};
export default useAllWhiteTokens;
