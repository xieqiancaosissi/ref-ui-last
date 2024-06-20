import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ITokenMetadata } from "../hooks/useBalanceTokens";
import { TokenMetadata } from "../services/ft-contract";
import { ftGetTokenMetadata } from "../services/token";
import { useState, useEffect } from "react";
export type ITokenStore = {
  get_whitelisted_tokens: () => string[];
  set_whitelisted_tokens: (whitelisted_tokens: ITokenMetadata[]) => void;
  get_auto_whitelisted_postfix: () => string[];
  set_auto_whitelisted_postfix: (auto_whitelisted_postfix: string[]) => void;
  get_common_tokens: () => ITokenMetadata[];
  set_common_tokens: (common_tokens: ITokenMetadata[]) => void;
  get_is_edited_common_tokens: () => boolean;
  set_is_edited_common_tokens: (is_edited_common_tokens: boolean) => void;
};
export type IAccountTokenStore = {
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
      common_tokens: [],
      is_edited_common_tokens: false,
      get_whitelisted_tokens: () => get().whitelisted_tokens,
      set_whitelisted_tokens: (whitelisted_tokens: string[]) =>
        set({ whitelisted_tokens }),
      get_auto_whitelisted_postfix: () => get().auto_whitelisted_postfix,
      set_auto_whitelisted_postfix: (auto_whitelisted_postfix: string[]) =>
        set({ auto_whitelisted_postfix }),
      get_common_tokens: () => get().common_tokens,
      set_common_tokens: (common_tokens: ITokenMetadata[]) =>
        set({ common_tokens }),
      get_is_edited_common_tokens: () => get().is_edited_common_tokens,
      set_is_edited_common_tokens: (is_edited_common_tokens: boolean) =>
        set({ is_edited_common_tokens }),
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

export const useTokens = (ids: string[] = [], curTokens?: TokenMetadata[]) => {
  const [tokens, setTokens] = useState<TokenMetadata[]>();

  useEffect(() => {
    if (curTokens && curTokens.length > 0) {
      setTokens(curTokens);
      return;
    }
    Promise.all<TokenMetadata>(ids.map((id) => ftGetTokenMetadata(id))).then(
      setTokens
    );
  }, [ids.join("")]);

  return tokens;
};
