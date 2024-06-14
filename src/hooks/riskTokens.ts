import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  useContext,
  createContext,
} from "react";

import { TokenMetadata } from "../services/ft-contract";
import {
  getWhitelistedTokensInfo,
  ftGetTokenMetadata,
} from "../services/token";

import { getTokens } from "../services/token";
import { getCurrentWallet } from "../utils/wallets-integration";
import db from "../db/RefDatabase";
import { get_auto_whitelisted_postfix } from "../services/token";

export const useWhitelistTokens = (extraTokenIds: string[] = []) => {
  const [tokens, setTokens] = useState<TokenMetadata[]>();
  useEffect(() => {
    getWhitelistedTokensInfo()
      .then(async (tokenInfo) => {
        const { globalWhitelist } = tokenInfo;
        const allWhiteTokenIds = [
          ...new Set([...globalWhitelist, ...extraTokenIds]),
        ];
        const allTokens = await getAllTokens();
        const postfix = await get_auto_whitelisted_postfix();
        const whiteMetaDataList = await Promise.all(
          allWhiteTokenIds.map((tokenId) => ftGetTokenMetadata(tokenId))
        );
        const globalMetaDataWhitelist = whiteMetaDataList.filter((m) =>
          globalWhitelist.includes(m.id)
        );
        const whiteMap = whiteMetaDataList.reduce(
          (sum, cur) => ({ ...sum, ...{ [cur.id]: cur } }),
          {}
        );
        allTokens
          .filter((token: TokenMetadata) => {
            return (
              postfix.some((p) => token.id.includes(p)) &&
              !globalMetaDataWhitelist.find((w) => w.id === token.id)
            );
          })
          .map((token) => {
            token.isRisk = true;
            whiteMap[token.id] = token;
            return token;
          });
        return Object.values(whiteMap) as TokenMetadata[];
      })
      .then(setTokens);
  }, [extraTokenIds.join("-")]);
  return tokens?.map((t) => ({ ...t, onRef: true }));
};
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
  return allTokens;
}
export const useRiskTokens = () => {
  const tokens = useWhitelistTokens();
  const pureIdList: any = [];
  const allRiskTokens = useMemo(() => {
    return tokens?.filter((token) => {
      token.isRisk && pureIdList.push(token.id);
      return token.isRisk;
    });
  }, [tokens]);
  return { allRiskTokens: allRiskTokens || [], pureIdList };
};
