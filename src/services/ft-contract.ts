import { getAccountId } from "@/utils/wallet";
import { viewFunction } from "@/utils/near";
import getConfigV2 from "@/utils/configV2";
import getConfig from "@/utils/config";
import { nearMetadata } from "./wrap-near";
const configV2 = getConfigV2();
export interface TokenMetadata {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
  ref?: number | string;
  near?: number | string;
  aurora?: number | string;
  total?: number;
  onRef?: boolean;
  onTri?: boolean;
  amountLabel?: string;
  amount?: number;
  dcl?: number | string;
  nearNonVisible?: number | string;
  t_value?: string;
  isRisk?: boolean;
  isUserToken?: boolean;
}

export const ftGetStorageBalance = async (
  tokenId: string
): Promise<any | null> => {
  return ftViewFunction(tokenId, {
    methodName: "storage_balance_of",
    args: { account_id: getAccountId() },
  });
};

export const ftViewFunction = (tokenId: string, { methodName, args }: any) => {
  return viewFunction({
    contractId: tokenId,
    methodName,
    args,
  });
};

export const unWrapToken = (token: TokenMetadata, keepId?: boolean) => {
  if (token.id === getConfig().WRAP_NEAR_CONTRACT_ID)
    return { ...nearMetadata, id: keepId ? token.id : nearMetadata.id };
  else return token;
};
