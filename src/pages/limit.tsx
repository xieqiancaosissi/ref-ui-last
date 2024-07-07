import { useEffect } from "react";
import dynamic from "next/dynamic";
import _ from "lodash";
import Input from "@/components/limit/Input";
import { SwitchIcon } from "@/components/limit/icons";
import { useAllPoolsV2 } from "@/hooks/usePools";
import useSelectTokens from "@/hooks/useSelectTokens";
import { useDefaultBalanceTokens } from "@/hooks/useBalanceTokens";
import RateContainer from "@/components/limit/RateContainer";
import FeeTiers from "@/components/limit/FeeTiers";
import { useSwapStore } from "@/stores/swap";
import {
  usePersistLimitStore,
  IPersistLimitStore,
  useLimitStore,
} from "@/stores/limitOrder";
import { getAllTokenPrices } from "@/services/farm";
const CreateOrderButton = dynamic(
  () => import("@/components/limit/CreateOrderButton"),
  { ssr: false }
);
export default function LimitOrderPage() {
  const { defaultList = [] } = useSelectTokens();
  useDefaultBalanceTokens(defaultList);
  const allPools = useAllPoolsV2();
  const persistLimitStore: IPersistLimitStore = usePersistLimitStore();
  const limitStore = useLimitStore();
  const dclPool = persistLimitStore.getDclPool();
  const allDclPools = persistLimitStore.getAllDclPools();
  const swapStore = useSwapStore();
  const tokenIn = limitStore.getTokenIn();
  const tokenOut = limitStore.getTokenOut();
  useEffect(() => {
    getAllTokenPrices().then((res) => {
      swapStore.setAllTokenPrices(res);
    });
  }, []);
  useEffect(() => {
    if (allPools) {
      persistLimitStore.setAllDclPools(allPools);
    }
  }, [allPools?.length]);
  useEffect(() => {
    if (allDclPools && !dclPool) {
      persistLimitStore.setDclPool(allDclPools[0]);
    }
  }, [allDclPools?.length, dclPool?.pool_id]);
  function onSwitch() {
    limitStore.setTokenIn(tokenOut);
    limitStore.setTokenOut(tokenIn);
  }
  return (
    <main className="flex justify-center mt-6 gap-5">
      {/* charts and records container */}
      <div
        className="border border-gray-30 rounded-lg"
        style={{ width: "850px" }}
      ></div>
      {/* create order container */}
      <div className="" style={{ width: "420px" }}>
        <span className="font-bold text-xl bg-textWhiteGradient bg-clip-text text-transparent">
          Limit Order
        </span>
        <div className="rounded-lg bg-dark-10 p-3.5 mt-2">
          <span className="text-sm text-gray-50">Selling</span>
          <Input className="mt-2.5" token={tokenIn} isIn />
          <div className="flex items-stretch gap-0.5 mt-0.5">
            <RateContainer />
            <FeeTiers />
          </div>
          <div
            className="flex items-center justify-center rounded border border-gray-50 border-opacity-20 cursor-pointer text-gray-50 hover:text-white my-4"
            style={{ height: "30px" }}
            onClick={onSwitch}
          >
            <SwitchIcon />
          </div>
          <span className="text-sm text-gray-50">Buying</span>
          <Input className="mt-2.5" token={tokenOut} isOut />
          <CreateOrderButton />
        </div>
      </div>
    </main>
  );
}
// SSR
export function getServerSideProps(context: any) {
  return {
    props: {
      data: "testdata",
    },
  };
}
