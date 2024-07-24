import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface IAppStore {
  getShowRiskModal: () => boolean;
  setShowRiskModal: (showRiskModal: boolean) => void;
}
export const useAppStore = create<IAppStore>((set: any, get: any) => ({
  showRiskModal: false,
  getShowRiskModal: () => get().showRiskModal,
  setShowRiskModal: (showRiskModal: boolean) => set({ showRiskModal }),
}));
