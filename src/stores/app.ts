import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface IAppStore {
  getShowRiskModal: () => boolean;
  setShowRiskModal: (showRiskModal: boolean) => void;
  getPersonalDataUpdatedSerialNumber: () => number;
  setPersonalDataUpdatedSerialNumber: (
    personalDataUpdatedSerialNumber: number
  ) => void;
}
export const useAppStore = create<IAppStore>((set: any, get: any) => ({
  showRiskModal: false,
  getShowRiskModal: () => get().showRiskModal,
  setShowRiskModal: (showRiskModal: boolean) => set({ showRiskModal }),
  personalDataUpdatedSerialNumber: 0,
  getPersonalDataUpdatedSerialNumber: () =>
    get().personalDataUpdatedSerialNumber,
  setPersonalDataUpdatedSerialNumber: (
    personalDataUpdatedSerialNumber: number
  ) =>
    set({
      personalDataUpdatedSerialNumber,
    }),
}));
