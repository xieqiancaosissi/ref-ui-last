import Big from "big.js";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { IOrderTab, Ticker, TokenInfo } from "@/interfaces/orderbook";
import { TokenMetadata } from "@/services/ft-contract";
export interface IOrderbookStore {
  getOrderTab: () => IOrderTab;
  setOrderTab: (orderTab: IOrderTab) => void;
}
export interface IOrderbookDataStore {
  getAllTickers: () => Ticker[];
  setAllTickers: (allTickers: Ticker[]) => void;
  getTokensInfo: () => TokenInfo[];
  setTokensInfo: (tokensInfo: TokenInfo[]) => void;
  getSymbol: () => string;
  setSymbol: (symbol: string) => void;
  getTokensMetaMap: () => Record<string, TokenMetadata>;
  setTokensMetaMap: (tokensMetaMap: Record<string, TokenMetadata>) => void;
}

export const useOrderbookStore = create<IOrderbookStore>(
  (set: any, get: any) => ({
    orderTab: "LIMIT",
    getOrderTab: () => get().orderTab,
    setOrderTab: (orderTab: IOrderTab) => set({ orderTab }),
  })
);
export const useOrderbookDataStore = create<IOrderbookDataStore>(
  (set: any, get: any) => ({
    allTickers: [],
    tokensInfo: [],
    symbol: "SPOT_NEAR_USDC.e",
    tokensMetaMap: {},
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
    getAllTickers: () => get().allTickers,
    setAllTickers: (allTickers: Ticker[]) =>
      set({
        allTickers,
      }),
    getTokensInfo: () => get().tokensInfo,
    setTokensInfo: (tokensInfo: TokenInfo[]) =>
      set({
        tokensInfo,
      }),
  })
);
