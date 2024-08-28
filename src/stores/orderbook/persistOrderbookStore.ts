import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface IPersistOrderbookDataStore {}

export const usePersistOrderbookDataStore = create(
  persist((set: any, get: any) => ({}), {
    name: "_cached_orderbook",
    version: 0.1,
    storage: createJSONStorage(() => localStorage),
  })
);
