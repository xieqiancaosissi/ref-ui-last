import { TokenMetadata } from "@/services/ft-contract";

export const getV3PoolId = (tokenA: string, tokenB: string, fee: number) => {
  const tokenSeq = [tokenA, tokenB].sort().join("|");

  return `${tokenSeq}|${fee}`;
};
export const tagValidator = (
  bestEstimate: { amount: string; tag: string },
  tokenIn: TokenMetadata,
  tokenInAmount: string
) => {
  if (!bestEstimate) return false;

  const tagInfo = bestEstimate?.tag?.split("|");

  return (
    !!bestEstimate &&
    !!bestEstimate?.tag &&
    tagInfo?.[0] === tokenIn?.id &&
    tagInfo?.[2] === tokenInAmount
  );
};
