import { useEffect, useState } from "react";

import { TokenMetadata } from "../services/ft-contract";
import { useTokenStore } from "../stores/token";
import {
  getGlobalWhitelist,
  getAccountWhitelist,
  ftGetTokenMetadata,
} from "../services/token";
export const useDefaultWhitelistTokens = () => {
  const [whiteListTokens, setWhiteListTokens] = useState<TokenMetadata[]>([]);
  const tokenStore = useTokenStore();
  useEffect(() => {
    getWhitelistTokens();
  }, []);
  async function getWhitelistTokens() {
    const globalWhitelistIds = await get_global_white_list();
    const accountWhitelistIds = await get_account_white_list();
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
  async function get_global_white_list() {
    const storeList = tokenStore.get_whitelisted_tokens();
    let final: string[] = [];
    if (storeList.length > 0) {
      getGlobalWhitelist().then((globalWhitelistIds) => {
        tokenStore.set_whitelisted_tokens(globalWhitelistIds);
      });
      final = storeList;
    } else {
      const globalWhitelistIds = await getGlobalWhitelist();
      tokenStore.set_whitelisted_tokens(globalWhitelistIds);
      final = globalWhitelistIds;
    }
    return final;
  }
  async function get_account_white_list() {
    const storeList = tokenStore.get_user_whitelisted_tokens();
    let final: string[] = [];
    if (storeList.length > 0) {
      getAccountWhitelist().then((accountWhitelistIds) => {
        tokenStore.set_user_whitelisted_tokens(accountWhitelistIds);
      });
      final = storeList;
    } else {
      const accountWhitelistIds = await getAccountWhitelist();
      tokenStore.set_user_whitelisted_tokens(accountWhitelistIds);
      final = accountWhitelistIds;
    }
    return final;
  }
  return whiteListTokens;
};
