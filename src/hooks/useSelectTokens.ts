import { useEffect, useState } from "react";
import { TokenMetadata } from "../services/ft-contract";
import { useDefaultWhitelistTokens } from "./useDefaultWhitelistTokens";
import { useAutoWhitelistTokens } from "./useAutoWhitelistTokens";
import { useAutoWhitelistedPostfix } from "../hooks/useAutoWhitelistedPostfix";
import getConfig from "../utils/config";
import getConfigV2 from "../utils/configV2";
import { NEAR_META_DATA, WNEAR_META_DATA } from "../utils/nearMetaData";
import { useTokenStore } from "../stores/token";
const { WRAP_NEAR_CONTRACT_ID } = getConfig();
const { HIDDEN_TOKEN_LIST } = getConfigV2();
interface ISelectTokens {
  defaultList: TokenMetadata[];
  autoList: TokenMetadata[];
  totalList: TokenMetadata[];
  tokensLoading: boolean;
}
export const useSelectTokens = (): ISelectTokens => {
  const [selectTokens, setSelectTokens] = useState<ISelectTokens | any>({
    defaultList: [],
    autoList: [],
    totalList: [],
    tokensLoading: true,
  });
  const whitelistToken = useDefaultWhitelistTokens();
  const autoWhitelistToken = useAutoWhitelistTokens(whitelistToken);
  const autoWhitelistedPostfix = useAutoWhitelistedPostfix();
  const tokenStore: any = useTokenStore();
  useEffect(() => {
    if (
      whitelistToken.length > 0 &&
      autoWhitelistToken.length > 0 &&
      autoWhitelistedPostfix.length > 0
    ) {
      getSelectTokens();
    }
  }, [
    whitelistToken.length,
    autoWhitelistToken.length,
    autoWhitelistedPostfix.length,
  ]);
  async function getSelectTokens() {
    const defaultList = whitelistToken.map((token) => {
      if (
        token.isUserToken &&
        autoWhitelistedPostfix.some((p) => token.id.includes(p))
      ) {
        return {
          ...token,
          isRisk: true,
        };
      }
      return token;
    });
    const autoList = autoWhitelistToken.map((token) => {
      return {
        ...token,
        isRisk: true,
      };
    });
    const wnearToken = getWnearToken(defaultList);
    defaultList.push(wnearToken);
    // init common tokens
    if (
      tokenStore.get_common_tokens().length === 0 &&
      !tokenStore.get_is_edited_common_tokens()
    ) {
      const { INIT_COMMON_TOKEN_IDS } = getConfigV2();
      const init_common_tokens = defaultList.filter(
        (token) =>
          token.symbol == "NEAR" || INIT_COMMON_TOKEN_IDS.includes(token.id)
      );
      tokenStore.set_common_tokens(init_common_tokens);
    }
    // set token forms
    setSelectTokens({
      defaultList: defaultList.filter(
        (token) => !HIDDEN_TOKEN_LIST.includes(token.id)
      ),
      autoList: autoList.filter(
        (token) => !HIDDEN_TOKEN_LIST.includes(token.id)
      ),
      totalList: [...defaultList, ...autoList].filter(
        (token) => !HIDDEN_TOKEN_LIST.includes(token.id)
      ),
      tokensLoading: false,
    });
  }
  function getWnearToken(tokens: TokenMetadata[]) {
    const NEAR = tokens.filter(
      (token) => token.id === WRAP_NEAR_CONTRACT_ID
    )[0];
    const wnearToken = JSON.parse(JSON.stringify(NEAR));
    wnearToken.icon = WNEAR_META_DATA.icon;
    wnearToken.symbol = WNEAR_META_DATA.symbol;
    wnearToken.name = "Wrapped NEAR fungible token";
    NEAR.icon = NEAR_META_DATA.icon;
    NEAR.symbol = "NEAR";
    NEAR.name = "Near";
    return wnearToken;
  }
  return selectTokens;
};
