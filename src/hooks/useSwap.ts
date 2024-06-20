import Big from "big.js";
import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import estimateSwap from "@/services/swap/estimateSwap";
import { ONLY_ZEROS, scientificNotationToString } from "@/utils/numbers";
import {
  useSwapStore,
  usePersistSwapStore,
  IPersistSwapStore,
} from "@/stores/swap";
import { ITokenMetadata } from "./useBalanceTokens";
const useSwap = () => {
  const [firstInput, setFirstInput] = useState<boolean>(true);
  const swapStore = useSwapStore();
  const persistSwapStore = usePersistSwapStore() as IPersistSwapStore;
  const tokenIn = swapStore.getTokenIn();
  const tokenOut = swapStore.getTokenOut();
  const tokenInAmount = swapStore.getTokenInAmount();
  const smartRoute = persistSwapStore.getSmartRoute();
  useDebounce(
    () => {
      if (tokenIn?.id && tokenOut?.id && Number(tokenInAmount) > 0) {
        doEstimateSwap({
          tokenIn,
          tokenOut,
          tokenInAmount,
        });
      }
    },
    firstInput ? 0 : 300,
    [tokenIn?.id, tokenOut?.id, tokenInAmount]
  );
  async function doEstimateSwap({
    tokenIn,
    tokenOut,
    tokenInAmount,
  }: {
    tokenIn: ITokenMetadata;
    tokenOut: ITokenMetadata;
    tokenInAmount: string;
  }) {
    const { estimates: estimatesRes } = await estimateSwap({
      tokenIn,
      tokenOut,
      amountIn: tokenInAmount,
      supportLedger: !smartRoute,
    });
    setFirstInput(false);
    const estimates = estimatesRes.map((e) => ({
      ...e,
      partialAmountIn: e.pool?.partialAmountIn,
    }));
    if (!estimates) throw "";
    if (tokenInAmount && !ONLY_ZEROS.test(tokenInAmount)) {
      const expectedOut = estimates.reduce(
        (acc, cur) =>
          acc.plus(cur.outputToken === tokenOut.id ? cur.estimate || 0 : 0),
        new Big(0)
      );
      const tokenOutAmount = scientificNotationToString(expectedOut.toString());
      swapStore.setTokenOutAmount(tokenOutAmount);
    }
  }
};

export default useSwap;
