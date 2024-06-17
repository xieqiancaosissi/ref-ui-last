import { useEffect, useState } from "react";
import { TokenMetadata } from "../services/ft-contract";
import { ftGetBalance } from "../services/token";
import { toReadableNumber } from "@/utils/numbers";

export interface ITokenMetadata extends TokenMetadata {
  balanceDecimal: string;
  balance: string;
}
export const useBalanceTokens = (tokens: TokenMetadata[]) => {
  const [balanceTokens, setBalanceTokens] = useState<ITokenMetadata[]>([]);
  useEffect(() => {
    if (tokens.length > 0) {
      getBalanceTokens();
    }
  }, [tokens]);
  async function getBalanceTokens() {
    const balancesPending = tokens.map((token: TokenMetadata) => {
      return ftGetBalance(token.symbol == "NEAR" ? "NEAR" : token.id);
    });
    const balances = await Promise.all(balancesPending);
    const tokensWithBalance = tokens.map((token: TokenMetadata, index) => {
      return {
        ...token,
        balanceDecimal: balances[index],
        balance: toReadableNumber(token.decimals, balances[index]),
      };
    }) as ITokenMetadata[];
    setBalanceTokens(tokensWithBalance);
  }
  return balanceTokens;
};
