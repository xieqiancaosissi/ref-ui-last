import { ITokenMetadata } from "@/hooks/useBalanceTokens";
import { IPoolDcl } from "@/interfaces/swapDcl";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
interface ILimitStore {
  getTokenIn: () => ITokenMetadata;
  setTokenIn: (token: ITokenMetadata) => void;
  getTokenOut: () => ITokenMetadata;
  setTokenOut: (token: ITokenMetadata) => void;
  getTokenInAmount: () => string;
  setTokenInAmount: (tokenInAmount: string) => void;
  getTokenOutAmount: () => string;
  setTokenOutAmount: (tokenOutAmount: string) => void;
  getRate: () => string;
  setRate: (rate: string) => void;
  getLock: () => boolean;
  setLock: (lock: boolean) => void;
}
export interface IPersistLimitStore {
  getDclPool: () => IPoolDcl;
  setDclPool: (dclPool: IPoolDcl) => void;
  getAllDclPools: () => IPoolDcl[];
  setAllDclPools: (allDclPools: IPoolDcl[]) => void;
}
export const usePersistLimitStore = create(
  persist(
    (set: any, get: any) => ({
      dclPool: null,
      getDclPool: () => get().dclPool,
      setDclPool: (dclPool: IPoolDcl) => set({ dclPool }),
      allDclPools: [],
      getAllDclPools: () => get().allDclPools,
      setAllDclPools: (allDclPools: IPoolDcl[]) => set({ allDclPools }),
    }),
    {
      name: "_cached_limit",
      version: 0.1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useLimitStore = create<ILimitStore>((set: any, get: any) => ({
  tokenIn: null,
  tokenOut: null,
  tokenInAmount: "1",
  tokenOutAmount: "",
  rate: "",
  lock: false,
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
  getRate: () => get().rate,
  setRate: (rate: string) => set({ rate }),
  getLock: () => get().lock,
  setLock: (lock: boolean) => set({ lock }),
}));
