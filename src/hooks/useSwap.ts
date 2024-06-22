import { useState } from "react";
import { useDebounce } from "react-use";
import estimateSwap from "@/services/swap/estimateSwap";
import { IEstimateResult } from "@/interfaces/swap";
import { usePersistSwapStore, IPersistSwapStore } from "@/stores/swap";
import { ITokenMetadata } from "./useBalanceTokens";
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
    firstInput ? 100 : 300,
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
    clear();
    estimateSwap({
      tokenIn,
      tokenOut,
      amountIn: tokenInAmount,
      supportLedger: !smartRoute,
      supportLittlePools,
    })
      .then(({ estimates }) => {
        setSwapEstimateResult({
          swapsToDo: estimates,
          quoteDone: true,
          tag: `${tokenIn.id}@${tokenOut.id}@${tokenInAmount}`,
        });
      })
      .catch((e) => {
        setSwapEstimateResult({
          swapError: e,
          quoteDone: true,
          tag: `${tokenIn.id}@${tokenOut.id}@${tokenInAmount}`,
        });
      });
  }
  function clear() {
    setSwapEstimateResult({});
  }
  return swapEstimateResult;
};

export default useSwap;
