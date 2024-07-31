import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "react-use";
import { TokenMetadata } from "../services/ft-contract";
import getConfigV2 from "../utils/configV2";
import { useTokenStore, ITokenStore } from "../stores/token";
import {
  getGlobalWhitelist,
  getAccountWhitelist,
  ftGetTokenMetadata,
  getTokenBalance,
  get_auto_whitelisted_postfix_list,
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
  ITokenMetadata,
  IUITokens,
} from "@/interfaces/tokens";
import { getTokenUIId } from "@/services/swap/swapUtils";
import { toReadableNumber } from "@/utils/numbers";
import { COMMON_TOKENS_TAG } from "@/utils/constantLocal";
const { HIDDEN_TOKEN_LIST } = getConfigV2();

const useAllWhiteTokensWithBalances = () => {
  const initUITokensData = {
    defaultAccountTokens: [],
    autoAccountTokens: [],
    done: false,
  };
  const initSelectTokensData = {
    defaultList: [],
    autoList: [],
    totalList: [],
    done: false,
  };
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
  const [UITokens, setUITokens] = useState<IUITokens>(initUITokensData);
  const tokenStore = useTokenStore() as ITokenStore;
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const walletLoading = accountStore.getWalletLoading();
  const balancesOwner = tokenStore.getBalancesOwner();
  const defaultAccountTokens = tokenStore.getDefaultAccountTokens();
  const autoAccountTokens = tokenStore.getAutoAccountTokens();
  const isCached = checkCache();
  const sourceDataFetchDone = useMemo(() => {
    return !!(
      globalWhitelistData.done &&
      postfixData.done &&
      listTokensData.done
    );
  }, [globalWhitelistData.done, postfixData.done, listTokensData.done]);
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
      if (balancesOwner == accountId && isCached) {
        // get data from cache
        getUITokensFromCache();
      }
    }
  }, [
    accountId,
    walletLoading,
    balancesOwner,
    JSON.stringify(defaultAccountTokens || []),
    JSON.stringify(autoAccountTokens || []),
  ]);
  useEffect(() => {
    if (!walletLoading && balancesOwner !== accountId) {
      // clear cache data
      tokenStore.setDefaultAccountTokens([]);
      tokenStore.setAutoAccountTokens([]);
    }
  }, [accountId, walletLoading, balancesOwner]);
  useDebounce(
    () => {
      if (!walletLoading && sourceDataFetchDone && accountWhitelistData.done) {
        getUITokensFromServer();
      }
    },
    1000,
    [
      sourceDataFetchDone,
      accountId,
      walletLoading,
      JSON.stringify(accountWhitelistData),
    ]
  );
  function getUITokensFromCache() {
    setUITokens({
      defaultAccountTokens,
      autoAccountTokens,
      done: true,
    });
  }
  async function getTokenMetaDatas(tokenIds: string[]) {
    const metadatas = (
      await Promise.all(tokenIds.map((tokenId) => ftGetTokenMetadata(tokenId)))
    ).filter((_) => _);
    return metadatas;
  }
  async function getGlobalWhitelistTokenIds() {
    const globalWhitelistInCache =
      tokenStore.get_global_whitelisted_tokens_ids();
    if (globalWhitelistInCache?.length) {
      setGlobalWhitelistData({
        globalWhitelist: globalWhitelistInCache,
        done: true,
      });
    }
    getGlobalWhitelist().then((globalWhitelist) => {
      setGlobalWhitelistData({
        globalWhitelist,
        done: true,
      });
      tokenStore.set_global_whitelisted_tokens_ids(globalWhitelist);
    });
  }
  async function getAccountWhitelistTokenIds() {
    setAccountWhitelistData({
      accountWhitelist: [],
      done: false,
    });
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
    const postfixListInCache = tokenStore.get_auto_whitelisted_postfix();
    if (postfixListInCache?.length) {
      setPostfixData({
        postfix: postfixListInCache,
        done: true,
      });
    }
    get_auto_whitelisted_postfix_list().then((postfixList) => {
      setPostfixData({
        postfix: postfixList || [],
        done: true,
      });
      tokenStore.set_auto_whitelisted_postfix(postfixList || []);
    });
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
  async function getUITokensFromServer() {
    setUITokens(initUITokensData);
    const { defaultList, autoList, done } = await getSelectTokensFromServer();
    if (done) {
      if (accountId) {
        const d_pending = getTokensBalance(defaultList);
        const a_pending = getTokensBalance(autoList);
        const tokensWithBalances = await Promise.all([d_pending, a_pending]);
        setUITokens({
          defaultAccountTokens: tokensWithBalances[0],
          autoAccountTokens: tokensWithBalances[1],
          done: true,
        });
      } else {
        setUITokens({
          defaultAccountTokens: defaultList,
          autoAccountTokens: autoList,
          done: true,
        });
      }
      tokenStore.setBalancesOwner(accountId);
    }
  }
  async function getTokensBalance(tokens: TokenMetadata[]) {
    const balancesPending = tokens.map((token: TokenMetadata) => {
      return getTokenBalance(getTokenUIId(token) == "near" ? "NEAR" : token.id);
    });
    const balances = await Promise.all(balancesPending);
    const tokensWithBalance = tokens.map((token: TokenMetadata, index) => {
      return {
        ...token,
        balanceDecimal: balances[index],
        balance: toReadableNumber(token.decimals, balances[index]),
      };
    }) as ITokenMetadata[];
    return tokensWithBalance;
  }
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
    tokenStore.setOwner(accountId);
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
    return reault;
  }
  async function initCommonTokens(defaultTokens: TokenMetadata[]) {
    // init common tokens
    const tag = tokenStore.get_common_tokens_tag();
    if (tag !== COMMON_TOKENS_TAG) {
      const { INIT_COMMON_TOKEN_IDS } = getConfigV2();
      const init_common_tokens = await getTokenMetaDatas(INIT_COMMON_TOKEN_IDS);
      tokenStore.set_common_tokens(init_common_tokens);
      tokenStore.set_common_tokens_tag(COMMON_TOKENS_TAG);
    }
  }
  function checkCache() {
    return !!defaultAccountTokens.length;
  }
  return UITokens;
};

export default useAllWhiteTokensWithBalances;
