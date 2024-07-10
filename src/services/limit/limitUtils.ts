import Big from "big.js";
import BigNumber from "bignumber.js";
import { ILimitStore } from "@/stores/limitOrder";
import { toPrecision } from "@/utils/numbers";
import { IPoolDcl } from "@/interfaces/swapDcl";
import { ftGetTokenMetadata } from "@/services/token";
import { toReadableNumber } from "@/utils/numbers";
import { getAllTokenPrices } from "@/services/farm";

export function getAmountOut({
  tokenInAmount,
  limitStore,
  rate,
}: {
  tokenInAmount: string;
  limitStore: ILimitStore;
  rate: string;
}) {
  let amountOut = new Big(rate || 0).mul(tokenInAmount || 0).toFixed();
  const minValue = "0.00000001";
  if (new Big(amountOut).gte(minValue)) {
    amountOut = toPrecision(amountOut, 8, false, false);
  }
  limitStore.setTokenOutAmount(amountOut);
}

export async function fillDclPool(p: IPoolDcl) {
  const token_x: any = p.token_x;
  const token_y: any = p.token_y;
  const tokenPriceList = await getAllTokenPrices();
  p.token_x_metadata = await ftGetTokenMetadata(token_x);
  p.token_y_metadata = await ftGetTokenMetadata(token_y);
  const pricex = tokenPriceList[token_x]?.price || 0;
  const pricey = tokenPriceList[token_y]?.price || 0;
  const { total_x, total_y, total_fee_x_charged, total_fee_y_charged }: any = p;
  const totalX = new BigNumber(total_x).minus(total_fee_x_charged).toFixed();
  const totalY = new BigNumber(total_y).minus(total_fee_y_charged).toFixed();
  const tvlx =
    Number(toReadableNumber(p.token_x_metadata?.decimals ?? 0, totalX)) *
    Number(pricex);
  const tvly =
    Number(toReadableNumber(p.token_y_metadata?.decimals ?? 0, totalY)) *
    Number(pricey);

  p.tvl = tvlx + tvly;
  p.tvlUnreal = Object.keys(tokenPriceList).length === 0;
  return p;
}
