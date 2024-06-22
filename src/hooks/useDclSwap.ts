import { useState } from "react";
import { useDebounce } from "react-use";
import estimateDclSwap from "@/services/swap/estimateDclSwap";
import { IEstimateDclSwapView, IEstimateResult } from "@/interfaces/swapDcl";
import { ITokenMetadata } from "./useBalanceTokens";
const useDclSwap = ({
  tokenIn,
  tokenOut,
  tokenInAmount,
  firstInput,
  setFirstInput,
  supportDclQuote,
}: {
  tokenIn: ITokenMetadata;
  tokenOut: ITokenMetadata;
  tokenInAmount: string;
  firstInput: boolean;
  setFirstInput: (f: boolean) => void;
  supportDclQuote: boolean;
}): IEstimateResult => {
  const [dclSwapEstimateResult, setDclSwapEstimateResult] =
    useState<IEstimateResult>({});
  useDebounce(
    () => {
      if (tokenIn?.id && tokenOut?.id && Number(tokenInAmount) > 0) {
        if (supportDclQuote) {
          doDclEstimateSwap({
            tokenIn,
            tokenOut,
            tokenInAmount,
          });
        } else {
          setFirstInput(false);
          setDclSwapEstimateResult({
            dclQuoteDone: true,
            dclTag: `${tokenIn.id}@${tokenOut.id}@${tokenInAmount}`,
          });
        }
      }
    },
    firstInput ? 100 : 300,
    [tokenIn?.id, tokenOut?.id, tokenInAmount]
  );
  async function doDclEstimateSwap({
    tokenIn,
    tokenOut,
    tokenInAmount,
  }: {
    tokenIn: ITokenMetadata;
    tokenOut: ITokenMetadata;
    tokenInAmount: string;
  }) {
    clear();
    estimateDclSwap({
      tokenIn,
      tokenOut,
      amountIn: tokenInAmount,
    })
      .then((estimate: IEstimateDclSwapView) => {
        setDclSwapEstimateResult({
          dclSwapsToDo: estimate,
          dclQuoteDone: true,
          dclTag: `${tokenIn.id}@${tokenOut.id}@${tokenInAmount}`,
        });
      })
      .catch((e) => {
        setDclSwapEstimateResult({
          dclSwapError: e,
          dclTag: `${tokenIn.id}@${tokenOut.id}@${tokenInAmount}`,
        });
      });
  }
  function clear() {
    setDclSwapEstimateResult({});
  }
  return dclSwapEstimateResult;
};

export default useDclSwap;
