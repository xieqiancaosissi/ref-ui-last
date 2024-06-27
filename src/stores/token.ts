import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ITokenMetadata } from "../hooks/useBalanceTokens";
export type ITokenStore = {
  get_global_whitelisted_tokens_ids: () => string[];
  set_global_whitelisted_tokens_ids: (whitelisted_tokens_ids: string[]) => void;
  get_auto_whitelisted_postfix: () => string[];
  set_auto_whitelisted_postfix: (auto_whitelisted_postfix: string[]) => void;
  get_common_tokens: () => ITokenMetadata[];
  set_common_tokens: (common_tokens: ITokenMetadata[]) => void;
  get_common_tokens_is_edited: () => boolean;
  set_common_tokens_is_edited: (common_tokens_is_edited: boolean) => void;
};
export type IAccountTokenStore = {
  get_user_whitelisted_tokens_ids: () => string[];
  set_user_whitelisted_tokens_ids: (
    user_whitelisted_tokens_ids: string[]
  ) => void;
  getDefaultAccountTokens: () => ITokenMetadata[];
  setDefaultAccountTokens: (defaultAccountTokens: ITokenMetadata[]) => void;
  getAutoAccountTokens: () => ITokenMetadata[];
  setAutoAccountTokens: (autoAccountTokens: ITokenMetadata[]) => void;
  getOwner: () => string;
  setOwner: (owner: string) => void;
};
export type IAccountBalanceStore = {
  getDefaultBalancesLoading: () => boolean;
  setDefaultBalancesLoading: (defaultBalancesLoading: boolean) => void;
  getAutoBalancesLoading: () => boolean;
  setAutoBalancesLoading: (autoBalancesLoading: boolean) => void;
};
export const useTokenStore = create(
  persist(
    (set, get: any) => ({
      global_whitelisted_tokens_ids: [],
      auto_whitelisted_postfix: [],
      common_tokens: [],
      common_tokens_is_edited: false,
      get_global_whitelisted_tokens_ids: () => get().whitelisted_tokens_ids,
      set_global_whitelisted_tokens_ids: (whitelisted_tokens_ids: string[]) =>
        set({ whitelisted_tokens_ids }),
      get_auto_whitelisted_postfix: () => get().auto_whitelisted_postfix,
      set_auto_whitelisted_postfix: (auto_whitelisted_postfix: string[]) =>
        set({ auto_whitelisted_postfix }),
      get_common_tokens: () => get().common_tokens,
      set_common_tokens: (common_tokens: ITokenMetadata[]) =>
        set({ common_tokens }),
      get_common_tokens_is_edited: () => get().common_tokens_is_edited,
      set_common_tokens_is_edited: (common_tokens_is_edited: boolean) =>
        set({ common_tokens_is_edited }),
    }),
    {
      name: "_cached_whitelisted_tokens_ids",
      version: 0.1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
export const useAccountTokenStore = create(
  persist(
    (set, get: any) => ({
      user_whitelisted_tokens_ids: [],
      defaultAccountTokens: [],
      autoAccountTokens: [],
      owner: "",
      get_user_whitelisted_tokens_ids: () => get().user_whitelisted_tokens_ids,
      set_user_whitelisted_tokens_ids: (
        user_whitelisted_tokens_ids: string[]
      ) => set({ user_whitelisted_tokens_ids }),
      getDefaultAccountTokens: () => get().defaultAccountTokens,
      setDefaultAccountTokens: (defaultAccountTokens: ITokenMetadata[]) =>
        set({ defaultAccountTokens }),
      getAutoAccountTokens: () => get().autoAccountTokens,
      setAutoAccountTokens: (autoAccountTokens: ITokenMetadata[]) =>
        set({ autoAccountTokens }),
      getOwner: () => get().owner,
      setOwner: (owner: string) => set({ owner }),
    }),
    {
      name: "_cached_account_tokens",
      version: 0.1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
export const useAccountBalanceTokenStore = create<IAccountBalanceStore>(
  (set: any, get: any) => ({
    defaultBalancesLoading: true,
    autoBalancesLoading: true,
    getDefaultBalancesLoading: () => get().defaultBalancesLoading,
    setDefaultBalancesLoading: (defaultBalancesLoading: boolean) =>
      set({ defaultBalancesLoading }),
    getAutoBalancesLoading: () => get().autoBalancesLoading,
    setAutoBalancesLoading: (autoBalancesLoading: boolean) =>
      set({ autoBalancesLoading }),
  })
);
