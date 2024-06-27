import Big from "big.js";
import { useEffect, useState } from "react";
import {
  ONLY_ZEROS,
  scientificNotationToString,
  toReadableNumber,
} from "@/utils/numbers";
import { useSwapStore } from "@/stores/swap";
import useSwap from "./useSwap";
import useDclSwap from "./useDclSwap";
import { getPriceImpact, getAverageFee } from "@/services/swap/swapUtils";
import { SwapContractType } from "@/interfaces/swap";
const useMultiSwap = ({
  supportDclQuote = false,
  supportLittlePools = false,
}: {
  supportDclQuote?: boolean;
  supportLittlePools?: boolean;
}) => {
  const [firstInput, setFirstInput] = useState<boolean>(true);
  const swapStore = useSwapStore();
  const tokenIn = swapStore.getTokenIn();
  const tokenOut = swapStore.getTokenOut();
  const tokenInAmount = swapStore.getTokenInAmount();
  const allTokenPrices = swapStore.getAllTokenPrices();
  const { swapError, swapsToDo, quoteDone, tag, is_near_wnear_swap } = useSwap({
    tokenIn,
    tokenOut,
    tokenInAmount,
    firstInput,
    setFirstInput,
    supportLittlePools,
  });
  const { dclSwapError, dclSwapsToDo, dclQuoteDone, dclTag } = useDclSwap({
    tokenIn,
    tokenOut,
    tokenInAmount,
    firstInput,
    setFirstInput,
    supportDclQuote,
  });
  useEffect(() => {
    if (quoteDone && dclQuoteDone && validator()) {
      doMultiEstimate();
    }
  }, [
    quoteDone,
    dclQuoteDone,
    tokenIn?.id,
    tokenOut?.id,
    tokenInAmount,
    JSON.stringify(swapsToDo || []),
    JSON.stringify(dclSwapsToDo || {}),
    is_near_wnear_swap,
    tag,
  ]);
  async function doMultiEstimate() {
    if (is_near_wnear_swap) {
      const tokenOutAmount = scientificNotationToString(
        tokenInAmount.toString()
      );
      swapStore.setTokenOutAmount(tokenOutAmount);
      return;
    }
    let expectedOutV1 = Big(0);
    let expectedOutDcl = Big(0);
    if (!swapError && swapsToDo) {
      const estimates = swapsToDo.map((e) => ({
        ...e,
        partialAmountIn: e.pool?.partialAmountIn,
        contract: "Ref_Classic" as SwapContractType,
      }));
      expectedOutV1 = estimates.reduce(
        (acc, cur) =>
          acc.plus(cur.outputToken === tokenOut.id ? cur.estimate || 0 : 0),
        new Big(0)
      );
      const priceImpactValue = getPriceImpact({
        estimates,
        tokenIn,
        tokenOut,
        tokenOutAmount: scientificNotationToString(expectedOutV1.toString()),
        tokenInAmount,
        tokenPriceList: allTokenPrices,
      });
      const avgFee = getAverageFee({
        estimates,
        tokenIn,
        tokenOut,
        tokenInAmount,
      });
      const priceImpact = scientificNotationToString(
        new Big(priceImpactValue).minus(new Big((avgFee || 0) / 100)).toString()
      );
      swapStore.setEstimates(estimates);
      swapStore.setPriceImpact(priceImpact);
      swapStore.setAvgFee(avgFee);
    }
    if (!dclSwapError && dclSwapsToDo) {
      expectedOutDcl = Big(
        toReadableNumber(
          tokenOut.decimals,
          new Big(dclSwapsToDo.amount || 0).toFixed()
        )
      );
    }
    if (tokenInAmount && !ONLY_ZEROS.test(tokenInAmount)) {
      const expectedOut = expectedOutV1.gt(expectedOutDcl || 0)
        ? expectedOutV1
        : expectedOutDcl;
      const tokenOutAmount = scientificNotationToString(expectedOut.toString());
      swapStore.setTokenOutAmount(tokenOutAmount);
    }
  }
  function validator() {
    if (tag && dclTag) {
      const [inId, outId, inAmount] = tag.split("@");
      const [dclInId, dclOutId, dclInAmount] = dclTag.split("@");
      return (
        inId == tokenIn?.id &&
        outId == tokenOut.id &&
        inAmount == tokenInAmount &&
        dclInId == tokenIn?.id &&
        dclOutId == tokenOut.id &&
        dclInAmount == tokenInAmount
      );
    }
    return false;
  }
};

export default useMultiSwap;
