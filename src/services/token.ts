import { getAccount } from "../utils/near";
import getConfig from "../utils/config";
import { getAuthenticationHeaders } from "../services/signature";
import db from "@/store/RefDatabase";
import { TokenMetadata } from "./ft-contract";

export async function ftGetTokenMetadata(tokenId: string) {
  let metadata: any = await db.allTokens().where({ id: tokenId }).first();
  if (!metadata) {
    const account = await getAccount();
    metadata = await account.viewFunction({
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

export const getAccountNearBalance = async () => {
  const account = await getAccount();
  return account
    .getAccountBalance()
    .then(({ available }) => ({ available }))
    .catch(() => {
      return { available: "0" };
    });
};

export const getTokens = async () => {
  return await fetch(getConfig().indexerUrl + "/list-token", {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      ...getAuthenticationHeaders("/list-token"),
    },
  })
    .then((res) => res.json())
    .then((tokens) => {
      return tokens;
    });
};

export const cacheTokens = async () => {
  const tokens = await getTokens();
  const tokenArr = Object.keys(tokens).map((key) => ({
    id: key,
    icon: tokens[key].icon,
    decimals: tokens[key].decimals,
    name: tokens[key].name,
    symbol: tokens[key].symbol,
  }));
  await db.tokens.bulkPut(
    tokenArr.map((token: TokenMetadata) => ({
      id: token.id,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      icon: token.icon,
    }))
  );
};

export const getWhitelistedTokensInfo = async (): Promise<
  Record<string, string[]>
> => {
  const account = await getAccount();
  const globalWhitelist = await account.viewFunction({
    contractId: getConfig().REF_FI_CONTRACT_ID as any,
    methodName: "get_whitelisted_tokens",
  });

  return {
    globalWhitelist: [...new Set<string>([...globalWhitelist])],
  };
};

export const getGlobalWhitelist = async (): Promise<string[]> => {
  const account = await getAccount();
  const globalWhitelist = await account.viewFunction({
    contractId: getConfig().REF_FI_CONTRACT_ID as any,
    methodName: "get_whitelisted_tokens",
  });
  return [...new Set<string>([...globalWhitelist])];
};

export const get_auto_whitelisted_postfix = async (): Promise<string[]> => {
  const account = await getAccount();
  const metadata = await account.viewFunction({
    contractId: getConfig().REF_FI_CONTRACT_ID as any,
    methodName: "metadata",
  });
  return metadata.auto_whitelisted_postfix;
};
