import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ITokenMetadata } from "@/interfaces/tokens";
export type ITokenStore = {
  get_global_whitelisted_tokens_ids: () => string[];
  set_global_whitelisted_tokens_ids: (whitelisted_tokens_ids: string[]) => void;
  get_auto_whitelisted_postfix: () => string[];
  set_auto_whitelisted_postfix: (auto_whitelisted_postfix: string[]) => void;
  get_common_tokens: () => ITokenMetadata[];
  set_common_tokens: (common_tokens: ITokenMetadata[]) => void;
  get_common_tokens_tag: () => string;
  set_common_tokens_tag: (common_tokens_tag: string) => void;
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
  getBalancesOwner: () => string;
  setBalancesOwner: (balancesOwner: string) => void;
};

export const useTokenStore = create(
  persist(
    (set, get: any) => ({
      global_whitelisted_tokens_ids: [],
      auto_whitelisted_postfix: [],
      common_tokens: [],
      common_tokens_tag: "",
      user_whitelisted_tokens_ids: [],
      defaultAccountTokens: [],
      autoAccountTokens: [],
      owner: "",
      balancesOwner: "",
      get_global_whitelisted_tokens_ids: () => get().whitelisted_tokens_ids,
      set_global_whitelisted_tokens_ids: (whitelisted_tokens_ids: string[]) =>
        set({ whitelisted_tokens_ids }),
      get_auto_whitelisted_postfix: () => get().auto_whitelisted_postfix,
      set_auto_whitelisted_postfix: (auto_whitelisted_postfix: string[]) =>
        set({ auto_whitelisted_postfix }),
      get_common_tokens: () => get().common_tokens,
      set_common_tokens: (common_tokens: ITokenMetadata[]) =>
        set({ common_tokens }),
      get_common_tokens_tag: () => get().common_tokens_tag,
      set_common_tokens_tag: (common_tokens_tag: string) =>
        set({ common_tokens_tag }),
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
      getBalancesOwner: () => get().balancesOwner,
      setBalancesOwner: (balancesOwner: string) =>
        set({
          balancesOwner,
        }),
    }),
    {
      name: "_cached_tokens",
      version: 0.1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
