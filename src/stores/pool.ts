import { create } from "zustand";

type PoolType = {
  poolListLoading: boolean;
  getPoolListLoading: () => boolean;
  setPoolListLoading: (status: boolean) => void;
  poolActiveTab: string;
  setPoolActiveTab: (tab: string) => void;
};
export const usePoolStore = create<PoolType>((set, get) => ({
  poolListLoading: true,
  getPoolListLoading: () => get().poolListLoading,
  setPoolListLoading: (poolListLoading: boolean) => {
    set({ poolListLoading });
  },
  poolActiveTab: "classic",
  setPoolActiveTab: (poolActiveTab: string) => {
    set({ poolActiveTab });
  },
}));
