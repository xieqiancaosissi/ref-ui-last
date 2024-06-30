import { useEffect, useState } from "react";
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
  hideLowTvlPools,
}: {
  tokenIn: ITokenMetadata;
  tokenOut: ITokenMetadata;
  tokenInAmount: string;
  firstInput: boolean;
  setFirstInput: (f: boolean) => void;
  hideLowTvlPools: boolean;
}): IEstimateResult => {
  const [swapEstimateResult, setSwapEstimateResult] = useState<IEstimateResult>(
    {}
  );
  const swapStore = useSwapStore();
  const persistSwapStore = usePersistSwapStore() as IPersistSwapStore;
  const smartRoute = persistSwapStore.getSmartRoute();
  const trigger = swapStore.getTrigger();
  useDebounce(
    () => {
      estimateWrap();
    },
    firstInput ? 100 : 300,
    [getTokenUIId(tokenIn), getTokenUIId(tokenOut), tokenInAmount, smartRoute]
  );
  useEffect(() => {
    if (trigger) {
      estimateWrap();
    }
  }, [trigger]);
  function estimateWrap() {
    setSwapEstimateResult({
      quoteDone: false,
      tag: `${tokenIn.id}@${tokenOut.id}@${tokenInAmount}`,
    });
    if (is_near_wnear_swap(tokenIn, tokenOut) && Number(tokenInAmount) > 0) {
      setSwapEstimateResult({
        is_near_wnear_swap: true,
        quoteDone: true,
        tag: `${tokenIn.id}@${tokenOut.id}@${tokenInAmount}`,
      });
      swapStore.setTrigger(false);
    } else if (
      tokenIn?.id &&
      tokenOut?.id &&
      tokenIn?.id !== tokenOut?.id &&
      Number(tokenInAmount) > 0
    ) {
      swapStore.setEstimating(true);
      doEstimateSwap({
        tokenIn,
        tokenOut,
        tokenInAmount,
      });
    }
  }
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
      hideLowTvlPools,
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
      })
      .finally(() => {
        swapStore.setTrigger(false);
      });
  }
  return swapEstimateResult;
};

export default useSwap;
