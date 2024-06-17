import { useEffect, useState } from "react";
import { getTokens } from "../services/indexer";
import db from "../db/RefDatabase";
import { TokenMetadata } from "../services/ft-contract";
import { useAutoWhitelistedPostfix } from "../hooks/useAutoWhitelistedPostfix";
export const useAutoWhitelistTokens = (whitelistToken: TokenMetadata[]) => {
  const [autoWhiteListTokens, setAutoWhiteListTokens] = useState<
    TokenMetadata[]
  >([]);
  const autoWhitelistedPostfix = useAutoWhitelistedPostfix();
  useEffect(() => {
    if (whitelistToken.length > 0 && autoWhitelistedPostfix.length) {
      getAutoWhitelistedTokens();
    }
  }, [whitelistToken.length, autoWhitelistedPostfix.length]);
  async function getAutoWhitelistedTokens() {
    const all_ref_tokens = await getAllTokens();
    const white_list_token_map: Record<string, TokenMetadata> =
      whitelistToken.reduce((sum, cur) => {
        return { ...sum, [cur.id]: cur };
      }, {});
    const auto_whitelisted_tokens = all_ref_tokens.filter(
      (token: TokenMetadata) =>
        autoWhitelistedPostfix.some((p) => token.id.includes(p)) &&
        !white_list_token_map[token.id]
    );
    setAutoWhiteListTokens(auto_whitelisted_tokens);
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
    return allTokens;
  }
  return autoWhiteListTokens;
};
