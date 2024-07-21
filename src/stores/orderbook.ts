import Big from "big.js";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { IOrderTab, Ticker, TokenInfo } from "@/interfaces/orderbook";
import { TokenMetadata } from "@/services/ft-contract";
import { IConnectStatus } from "@/interfaces/orderbook";
export interface IOrderbookStore {
  getOrderTab: () => IOrderTab;
  setOrderTab: (orderTab: IOrderTab) => void;
}
export interface IPersistOrderbookDataStore {
  getConnectStatusx: () => IConnectStatus;
  setConnectStatusx: (connectStatusx: IConnectStatus) => void;
}
export interface IOrderbookWSDataStore {
  getAllTickers: () => Ticker[];
  setAllTickers: (allTickers: Ticker[]) => void;
}
export interface IOrderbookDataStore {
  getTokensInfo: () => TokenInfo[];
  setTokensInfo: (tokensInfo: TokenInfo[]) => void;
  getSymbol: () => string;
  setSymbol: (symbol: string) => void;
  getTokensMetaMap: () => Record<string, TokenMetadata>;
  setTokensMetaMap: (tokensMetaMap: Record<string, TokenMetadata>) => void;
  getUserExists: () => boolean;
  setUserExists: (userExist: boolean) => void;
  getConnectStatus: () => IConnectStatus;
  setConnectStatus: (connectStatus: IConnectStatus) => void;
}

export const useOrderbookStore = create<IOrderbookStore>(
  (set: any, get: any) => ({
    orderTab: "LIMIT",
    getOrderTab: () => get().orderTab,
    setOrderTab: (orderTab: IOrderTab) => set({ orderTab }),
  })
);
export const useOrderbookWSDataStore = create<IOrderbookWSDataStore>(
  (set: any, get: any) => ({
    allTickers: [],
    getAllTickers: () => get().allTickers,
    setAllTickers: (allTickers: Ticker[]) =>
      set({
        allTickers,
      }),
  })
);
export const useOrderbookDataStore = create<IOrderbookDataStore>(
  (set: any, get: any) => ({
    tokensInfo: [],
    symbol: "SPOT_NEAR_USDC.e",
    tokensMetaMap: {},
    userExist: false,
    connectStatus: "status_fetching",
    getConnectStatus: () => get().connectStatus,
    setConnectStatus: (connectStatus: IConnectStatus) => set({ connectStatus }),
    getUserExists: () => get().userExist,
    setUserExists: (userExist: boolean) =>
      set({
        userExist,
      }),
    getSymbol: () => get().symbol,
    setSymbol: (symbol: string) =>
      set({
        symbol,
      }),
    getTokensMetaMap: () => get().tokensMetaMap,
    setTokensMetaMap: (tokensMetaMap: Record<string, TokenMetadata>) =>
      set({
        tokensMetaMap,
      }),
    getTokensInfo: () => get().tokensInfo,
    setTokensInfo: (tokensInfo: TokenInfo[]) =>
      set({
        tokensInfo,
      }),
  })
);
export const usePersistOrderbookDataStore = create(
  persist(
    (set: any, get: any) => ({
      connectStatusx: "",
      getConnectStatusx: () => get().connectStatusx,
      setConnectStatusx: (connectStatusx: IConnectStatus) =>
        set({ connectStatusx }),
    }),
    {
      name: "_cached_orderbook",
      version: 0.1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
