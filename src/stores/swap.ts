import { ITokenMetadata } from "@/hooks/useBalanceTokens";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { TokenPrice } from "@/db/RefDatabase";
import { EstimateSwapView } from "@/interfaces/swap";

export interface IPersistSwapStore {
  getSmartRoute: () => boolean;
  setSmartRoute: (smartRoute: boolean) => void;
  getSlippage: () => number;
  setSlippage: (slippage: number) => void;
  getTokenInId: () => string;
  setTokenInId: (tokenInId: string) => void;
  getTokenOutId: () => string;
  setTokenOutId: (tokenOutId: string) => void;
}
export const usePersistSwapStore = create(
  persist(
    (set: any, get: any) => ({
      smartRoute: true,
      slippage: 0.5,
      tokenInId: "",
      tokenOutId: "",
      getSmartRoute: () => get().smartRoute,
      setSmartRoute: (smartRoute: boolean) => {
        set({
          smartRoute,
        });
      },
      getSlippage: () => get().slippage,
      setSlippage: (slippage: number) => set({ slippage }),
      getTokenInId: () => get().tokenInId,
      setTokenInId: (tokenInId: string) => set({ tokenInId }),
      getTokenOutId: () => get().tokenOutId,
      setTokenOutId: (tokenOutId: string) => set({ tokenOutId }),
    }),
    {
      name: "_cached_swap",
      version: 0.1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

interface ISwapStore {
  getTokenIn: () => ITokenMetadata;
  setTokenIn: (token: ITokenMetadata) => void;
  getTokenOut: () => ITokenMetadata;
  setTokenOut: (token: ITokenMetadata) => void;
  getTokenInAmount: () => string;
  setTokenInAmount: (tokenInAmount: string) => void;
  getTokenOutAmount: () => string;
  setTokenOutAmount: (tokenOutAmount: string) => void;
  getPriceImpact: () => string;
  setPriceImpact: (priceImpact: string) => void;
  getAvgFee: () => number;
  setAvgFee: (avgFee: number) => void;
  getEstimates: () => EstimateSwapView[];
  setEstimates: (estimates: EstimateSwapView[]) => void;
  getAllTokenPrices: () => Record<string, TokenPrice>;
  setAllTokenPrices: (allTokenPrices: Record<string, TokenPrice>) => void;
}
export const useSwapStore = create<ISwapStore>((set: any, get: any) => ({
  tokenIn: null,
  tokenOut: null,
  tokenInAmount: "",
  tokenOutAmount: "",
  priceImpact: "",
  avgFee: "",
  allTokenPrices: {},
  estimates: [],
  getTokenIn: () => get().tokenIn,
  setTokenIn: (tokenIn: ITokenMetadata) =>
    set({
      tokenIn,
    }),
  getTokenOut: () => get().tokenOut,
  setTokenOut: (tokenOut: ITokenMetadata) =>
    set({
      tokenOut,
    }),
  getTokenInAmount: () => get().tokenInAmount,
  setTokenInAmount: (tokenInAmount: string) => set({ tokenInAmount }),
  getTokenOutAmount: () => get().tokenOutAmount,
  setTokenOutAmount: (tokenOutAmount: string) => set({ tokenOutAmount }),
  getPriceImpact: () => get().priceImpact,
  setPriceImpact: (priceImpact: string) => set({ priceImpact }),
  getAvgFee: () => get().avgFee,
  setAvgFee: (avgFee: number) => set({ avgFee }),
  getEstimates: () => get().estimates,
  setEstimates: (estimates: EstimateSwapView[]) => set({ estimates }),
  getAllTokenPrices: () => get().allTokenPrices,
  setAllTokenPrices: (allTokenPrices: Record<string, TokenPrice>) =>
    set({ allTokenPrices }),
}));
