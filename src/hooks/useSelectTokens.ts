import { useEffect, useState } from "react";
import { TokenMetadata } from "../services/ft-contract";
import { useDefaultWhitelistTokens } from "./useDefaultWhitelistTokens";
import { useAutoWhitelistTokens } from "./useAutoWhitelistTokens";
import { useAutoWhitelistedPostfix } from "../hooks/useAutoWhitelistedPostfix";
import getConfig from "../utils/config";
import { NEAR_META_DATA, WNEAR_META_DATA } from "../utils/nearMetaData";
const { WRAP_NEAR_CONTRACT_ID } = getConfig();
interface ISelectTokens {
  defaultList: TokenMetadata[];
  autoList: TokenMetadata[];
  totalList: TokenMetadata[];
}
export const useSelectTokens = (): ISelectTokens => {
  const [selectTokens, setSelectTokens] = useState<ISelectTokens | any>({});
  const whitelistToken = useDefaultWhitelistTokens();
  const autoWhitelistToken = useAutoWhitelistTokens(whitelistToken);
  const autoWhitelistedPostfix = useAutoWhitelistedPostfix();
  useEffect(() => {
    if (
      whitelistToken.length > 0 &&
      autoWhitelistToken.length > 0 &&
      autoWhitelistedPostfix.length > 0
    ) {
      getSelectTokens();
    }
  }, [whitelistToken, autoWhitelistToken, autoWhitelistedPostfix]);
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
    setSelectTokens({
      defaultList,
      autoList,
      totalList: [...defaultList, ...autoList],
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
