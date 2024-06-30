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
import { SwapContractType, EstimateSwapView } from "@/interfaces/swap";
import { IEstimateDclSwapView } from "@/interfaces/swapDcl";
import { getDclPoolByIdFromCache } from "@/services/swap/swapDcl";
import { getV3PoolId, getDclPriceImpact } from "@/services/swap/swapDclUtils";
import { IPoolDcl } from "@/interfaces/swapDcl";
const useMultiSwap = ({
  supportDclQuote = false,
  hideLowTvlPools = false,
}: {
  supportDclQuote?: boolean;
  hideLowTvlPools?: boolean;
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
    hideLowTvlPools,
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
    dclTag,
    swapError,
    dclSwapError,
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
      swapStore.setEstimates(estimates);
    }
    if (!dclSwapError && dclSwapsToDo) {
      expectedOutDcl = Big(
        toReadableNumber(
          tokenOut.decimals,
          new Big(dclSwapsToDo.amount || 0).toFixed()
        )
      );
      swapStore.setEstimatesDcl(dclSwapsToDo);
      swapStore.setSwapError(undefined);
    }
    if (swapError && (dclSwapError || !dclSwapsToDo)) {
      swapStore.setSwapError(swapError);
      return;
    } else {
      swapStore.setSwapError(undefined);
    }
    if (tokenInAmount && !ONLY_ZEROS.test(tokenInAmount)) {
      let expectedOut;
      if (expectedOutV1.gt(expectedOutDcl || 0)) {
        const { avgFee, priceImpact } = getV1EstimateDetailData(
          swapsToDo as EstimateSwapView[]
        );
        swapStore.setPriceImpact(priceImpact);
        swapStore.setAvgFee(avgFee);
        swapStore.setBest("v1");
        expectedOut = expectedOutV1;
      } else {
        const { fee, priceImpact } = await getDclEstimateDetailData(
          dclSwapsToDo as IEstimateDclSwapView
        );
        swapStore.setPriceImpact(priceImpact);
        swapStore.setAvgFee(fee);
        swapStore.setBest("v3");
        expectedOut = expectedOutDcl;
      }
      const tokenOutAmount = scientificNotationToString(expectedOut.toString());
      swapStore.setTokenOutAmount(tokenOutAmount);
    }
  }
  function getV1EstimateDetailData(swapsToDo: EstimateSwapView[]) {
    const estimates = swapsToDo.map((e) => ({
      ...e,
      partialAmountIn: e.pool?.partialAmountIn,
      contract: "Ref_Classic" as SwapContractType,
    }));
    const expectedOutV1 = estimates.reduce(
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
    return {
      avgFee,
      priceImpact,
    };
  }
  async function getDclEstimateDetailData(dclSwapsToDo: IEstimateDclSwapView) {
    const expectedOutDcl = Big(
      toReadableNumber(
        tokenOut.decimals,
        new Big(dclSwapsToDo?.amount || 0).toFixed()
      )
    );
    const bestFee = Number(dclSwapsToDo?.tag?.split("|")?.[1] ?? 0);
    const dcl_pool_id = getV3PoolId(tokenIn.id, tokenOut.id, bestFee);
    const bestDclPool = (await getDclPoolByIdFromCache(
      dcl_pool_id
    )) as IPoolDcl;
    const priceImpact = getDclPriceImpact({
      tokenIn,
      tokenOut,
      bestPool: bestDclPool,
      bestFee,
      tokenInAmount,
      tokenOutAmount: expectedOutDcl.toFixed(),
    });
    return {
      fee: +bestFee / 100,
      priceImpact,
    };
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
