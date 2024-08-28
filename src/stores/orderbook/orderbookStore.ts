import { create } from "zustand";
import { IOrderTab } from "@/interfaces/orderbook";
export interface IOrderbookStore {
  getOrderTab: () => IOrderTab;
  setOrderTab: (orderTab: IOrderTab) => void;
  getIsOrderlyConnecting: () => boolean;
  setIsOrderlyConnecting: (isOrderlyConnecting: boolean) => void;
}
export const useOrderbookStore = create<IOrderbookStore>(
  (set: any, get: any) => ({
    orderTab: "LIMIT",
    isOrderlyConnecting: false,
    getOrderTab: () => get().orderTab,
    setOrderTab: (orderTab: IOrderTab) => set({ orderTab }),
    getIsOrderlyConnecting: () => get().isOrderlyConnecting,
    setIsOrderlyConnecting: (isOrderlyConnecting: boolean) =>
      set({ isOrderlyConnecting }),
  })
);
