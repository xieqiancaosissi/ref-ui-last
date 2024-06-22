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
  const { swapError, swapsToDo, quoteDone, tag } = useSwap({
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
    tag,
  ]);
  async function doMultiEstimate() {
    let expectedOutV1 = Big(0);
    let expectedOutDcl = Big(0);
    if (!swapError && swapsToDo) {
      const estimates = swapsToDo.map((e) => ({
        ...e,
        partialAmountIn: e.pool?.partialAmountIn,
      }));
      expectedOutV1 = estimates.reduce(
        (acc, cur) =>
          acc.plus(cur.outputToken === tokenOut.id ? cur.estimate || 0 : 0),
        new Big(0)
      );
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
