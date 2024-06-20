import { getAccount } from "../utils/near";
import getConfig from "../utils/config";
import { getAccountId } from "../utils/wallet";
import { viewFunction } from "../utils/near";
import db from "@/db/RefDatabase";
import { useEffect, useState } from "react";
import { TokenMetadata } from "./ft-contract";

export async function ftGetTokenMetadata(tokenId: string) {
  let metadata: any = await db.allTokens().where({ id: tokenId }).first();
  if (!metadata) {
    metadata = await viewFunction({
      contractId: tokenId,
      methodName: "ft_metadata",
      args: {},
    });
    await db.allTokens().put({
      id: tokenId,
      name: metadata.name,
      symbol: metadata.symbol,
      decimals: metadata.decimals,
      icon: metadata.icon,
    });
  }

  return {
    id: tokenId,
    ...metadata,
  };
}
export const ftGetTokensMetadata = async (tokenIds: string[]) => {
  const tokensMetadata = await Promise.all(
    tokenIds.map((id: string) => ftGetTokenMetadata(id))
  );

  return tokensMetadata.reduce((pre, cur, i) => {
    return {
      ...pre,
      [tokenIds[i]]: cur,
    };
  }, {});
};

export const getAccountNearBalance = async () => {
  const account = await getAccount();
  return account
    .getAccountBalance()
    .then(({ available }) => ({ available }))
    .catch(() => {
      return { available: "0" };
    });
};

export const getGlobalWhitelist = async (): Promise<string[]> => {
  const globalWhitelist = await viewFunction({
    contractId: getConfig().REF_FI_CONTRACT_ID as string,
    methodName: "get_whitelisted_tokens",
  });
  return [...new Set<string>([...globalWhitelist])];
};
export const getAccountWhitelist = async (
  accountId: string = getAccountId()
): Promise<string[]> => {
  const accountWhitelist = await viewFunction({
    contractId: getConfig().REF_FI_CONTRACT_ID as string,
    methodName: "get_user_whitelisted_tokens",
    args: { account_id: accountId },
  });
  return [...new Set<string>([...accountWhitelist])];
};

export const get_auto_whitelisted_postfix_list = async (): Promise<
  string[]
> => {
  const metadata = await viewFunction({
    contractId: getConfig().REF_FI_CONTRACT_ID as string,
    methodName: "metadata",
  });
  return metadata.auto_whitelisted_postfix;
};

export const ftGetBalance = (tokenId: string, account_id?: string) => {
  if (tokenId === "NEAR") {
    return getAccountNearBalance().then(({ available }: any) => available);
  }
  return viewFunction({
    contractId: tokenId,
    methodName: "ft_balance_of",
    args: {
      account_id: getAccountId(),
    },
  }).catch(() => "0");
};

export const useTokens = (ids: string[] = [], curTokens?: TokenMetadata[]) => {
  const [tokens, setTokens] = useState<TokenMetadata[]>();

  useEffect(() => {
    if (curTokens && curTokens.length > 0) {
      setTokens(curTokens);
      return;
    }
    Promise.all<TokenMetadata>(ids.map((id) => ftGetTokenMetadata(id))).then(
      setTokens
    );
  }, [ids.join("")]);

  return tokens;
};
