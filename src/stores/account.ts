import { create } from "zustand";

type IAccountStore = {
  accountId: string;
  isSignedIn: boolean;
  setAccountId: (accountId: string) => void;
  getAccountId: () => string;
  getIsSignedIn: () => boolean;
  setIsSignedIn: (isSignedIn: boolean) => void;
};
export const useAccountStore = create<IAccountStore>((set, get) => ({
  accountId: "",
  isSignedIn: false,
  setAccountId: (accountId: string) => set({ accountId }),
  getAccountId: () => get().accountId,
  setIsSignedIn: (isSignedIn: boolean) => {
    set({ isSignedIn });
  },
  getIsSignedIn: () => get().isSignedIn,
}));
