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
  isDefaultWhiteToken?: boolean;
}

export const ftGetStorageBalance = async (
  tokenId: string
): Promise<any | null> => {
  if (configV2.NO_REQUIRED_REGISTRATION_TOKEN_IDS.includes(tokenId)) {
    const r = await native_usdc_has_upgrated(tokenId);
    if (r) {
      return ftViewFunction(tokenId, {
        methodName: "storage_balance_of",
        args: { account_id: getAccountId() },
      });
    } else {
      return check_registration(tokenId).then((is_registration) => {
        if (is_registration) {
          return new Promise((resove) => {
            resove({ available: "1", total: "1" });
          });
        } else {
          return new Promise((resove) => {
            resove(null);
          });
        }
      });
    }
  }
  return ftViewFunction(tokenId, {
    methodName: "storage_balance_of",
    args: { account_id: getAccountId() },
  });
};

export const native_usdc_has_upgrated = async (tokenId: string) => {
  try {
    await ftViewFunction(tokenId, {
      methodName: "storage_balance_of",
      args: { account_id: getAccountId() },
    });
    return true;
  } catch (error) {
    await check_registration(tokenId).then((is_registration) => {
      if (is_registration) {
        return new Promise((resove) => {
          resove({ available: "1", total: "1" });
        });
      } else {
        return new Promise((resove) => {
          resove(null);
        });
      }
    });
    return false;
  }
};

export const check_registration = (tokenId: string): Promise<any | null> => {
  return ftViewFunction(tokenId, {
    methodName: "check_registration",
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
