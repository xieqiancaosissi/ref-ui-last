import { useState } from "react";
import { useDebounce } from "react-use";
import estimateSwap from "@/services/swap/estimateSwap";
import { IEstimateResult } from "@/interfaces/swap";
import {
  usePersistSwapStore,
  IPersistSwapStore,
  useSwapStore,
} from "@/stores/swap";
import { ITokenMetadata } from "./useBalanceTokens";
import { getTokenUIId, is_near_wnear_swap } from "@/services/swap/swapUtils";
const useSwap = ({
  tokenIn,
  tokenOut,
  tokenInAmount,
  firstInput,
  setFirstInput,
  supportLittlePools,
}: {
  tokenIn: ITokenMetadata;
  tokenOut: ITokenMetadata;
  tokenInAmount: string;
  firstInput: boolean;
  setFirstInput: (f: boolean) => void;
  supportLittlePools: boolean;
}): IEstimateResult => {
  const [swapEstimateResult, setSwapEstimateResult] = useState<IEstimateResult>(
    {}
  );
  const persistSwapStore = usePersistSwapStore() as IPersistSwapStore;
  const smartRoute = persistSwapStore.getSmartRoute();
  const swapStore = useSwapStore();
  useDebounce(
    () => {
      if (is_near_wnear_swap(tokenIn, tokenOut) && Number(tokenInAmount) > 0) {
        clear();
        setSwapEstimateResult({
          is_near_wnear_swap: true,
          quoteDone: true,
          tag: `${tokenIn.id}@${tokenOut.id}@${tokenInAmount}`,
        });
      } else if (
        tokenIn?.id &&
        tokenOut?.id &&
        tokenIn?.id !== tokenOut?.id &&
        Number(tokenInAmount) > 0
      ) {
        doEstimateSwap({
          tokenIn,
          tokenOut,
          tokenInAmount,
        });
      }
    },
    firstInput ? 100 : 300,
    [getTokenUIId(tokenIn), getTokenUIId(tokenOut), tokenInAmount, smartRoute]
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
    estimateSwap({
      tokenIn,
      tokenOut,
      amountIn: tokenInAmount,
      supportLedger: !smartRoute,
      supportLittlePools,
    })
      .then(({ estimates }) => {
        clearError();
        setSwapEstimateResult({
          swapsToDo: estimates,
          quoteDone: true,
          tag: `${tokenIn.id}@${tokenOut.id}@${tokenInAmount}`,
        });
      })
      .catch((e) => {
        clear();
        setSwapEstimateResult({
          swapError: e,
          quoteDone: true,
          tag: `${tokenIn.id}@${tokenOut.id}@${tokenInAmount}`,
        });
      });
  }
  function clear() {
    setSwapEstimateResult({});
    swapStore.setAvgFee("");
    swapStore.setPriceImpact("");
    swapStore.setEstimates([]);
  }
  function clearError() {
    swapStore.setSwapError(undefined);
  }
  return swapEstimateResult;
};

export default useSwap;
