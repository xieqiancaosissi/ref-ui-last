import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ITokenMetadata } from "../hooks/useBalanceTokens";
type ITokenStore = {
  whitelisted_tokens: string[];
  auto_whitelisted_postfix: string[];
  get_whitelisted_tokens: () => string[];
  set_whitelisted_tokens: (whitelisted_tokens: ITokenMetadata[]) => void;
  get_auto_whitelisted_postfix: () => string[];
  set_auto_whitelisted_postfix: (auto_whitelisted_postfix: string[]) => void;
};
type IAccountTokenStore = {
  user_whitelisted_tokens: string[];
  defaultAccountBalances: ITokenMetadata[];
  autoAccountBalances: ITokenMetadata[];
  get_user_whitelisted_tokens: () => string[];
  set_user_whitelisted_tokens: (user_whitelisted_tokens: string[]) => void;
  getDefaultAccountBalances: () => ITokenMetadata[];
  setDefaultAccountBalances: (defaultAccountBalances: ITokenMetadata[]) => void;
  getAutoAccountBalances: () => ITokenMetadata[];
  setAutoAccountBalances: (autoAccountBalances: ITokenMetadata[]) => void;
};

export const useTokenStore = create(
  persist(
    (set, get: any) => ({
      whitelisted_tokens: [],
      auto_whitelisted_postfix: [],
      get_whitelisted_tokens: () => get().whitelisted_tokens,
      set_whitelisted_tokens: (whitelisted_tokens: string[]) =>
        set({ whitelisted_tokens }),
      get_auto_whitelisted_postfix: () => get().auto_whitelisted_postfix,
      set_auto_whitelisted_postfix: (auto_whitelisted_postfix: string[]) =>
        set({ auto_whitelisted_postfix }),
    }),
    {
      name: "_cached_whitelisted_tokens",
      version: 0.1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
export const useAccountTokenStore = create(
  persist(
    (set, get: any) => ({
      user_whitelisted_tokens: [],
      defaultAccountBalances: [],
      autoAccountBalances: [],
      get_user_whitelisted_tokens: () => get().user_whitelisted_tokens,
      set_user_whitelisted_tokens: (user_whitelisted_tokens: string[]) =>
        set({ user_whitelisted_tokens }),
      getDefaultAccountBalances: () => get().defaultAccountBalances,
      setDefaultAccountBalances: (defaultAccountBalances: ITokenMetadata[]) =>
        set({ defaultAccountBalances }),
      getAutoAccountBalances: () => get().autoAccountBalances,
      setAutoAccountBalances: (autoAccountBalances: ITokenMetadata[]) =>
        set({ autoAccountBalances }),
    }),
    {
      name: "_cached_account_tokens",
      version: 0.1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
