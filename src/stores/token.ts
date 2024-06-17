import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ITokenMetadata } from "../hooks/useBalanceTokens";
type ITokenStore = {
  accountId: string;
  whitelisted_tokens: string[];
  user_whitelisted_tokens: string[];
  auto_whitelisted_postfix: string[];
  defaultAccountBalances: ITokenMetadata[];
  autoAccountBalances: ITokenMetadata[];
  get_whitelisted_tokens: () => string[];
  set_whitelisted_tokens: (whitelisted_tokens: string[]) => void;
  get_user_whitelisted_tokens: () => string[];
  set_user_whitelisted_tokens: (user_whitelisted_tokens: string[]) => void;
  get_auto_whitelisted_postfix: () => string[];
  set_auto_whitelisted_postfix: (auto_whitelisted_postfix: string[]) => void;
  getDefaultAccountBalances: () => ITokenMetadata[];
  setDefaultAccountBalances: (defaultAccountBalances: ITokenMetadata[]) => void;
  getAutoAccountBalances: () => ITokenMetadata[];
  setAutoAccountBalances: (autoAccountBalances: ITokenMetadata[]) => void;
};

export const useTokenStore = create(
  persist(
    (set, get: any) => ({
      accountId: "",
      whitelisted_tokens: [],
      user_whitelisted_tokens: [],
      auto_whitelisted_postfix: [],
      defaultAccountBalances: [],
      autoAccountBalances: [],
      get_whitelisted_tokens: () => get().whitelisted_tokens,
      set_whitelisted_tokens: (whitelisted_tokens: string[]) =>
        set({ whitelisted_tokens }),
      get_user_whitelisted_tokens: () => get().user_whitelisted_tokens,
      set_user_whitelisted_tokens: (user_whitelisted_tokens: string[]) =>
        set({ user_whitelisted_tokens }),
      get_auto_whitelisted_postfix: () => get().auto_whitelisted_postfix,
      set_auto_whitelisted_postfix: (auto_whitelisted_postfix: string[]) =>
        set({ auto_whitelisted_postfix }),
      getDefaultAccountBalances: () => get().defaultAccountBalances,
      setDefaultAccountBalances: (defaultAccountBalances: ITokenMetadata[]) =>
        set({ defaultAccountBalances }),
      getAutoAccountBalances: () => get().autoAccountBalances,
      setAutoAccountBalances: (autoAccountBalances: ITokenMetadata[]) =>
        set({ autoAccountBalances }),
      setAccountId: (accountId: string) => set({ accountId }),
      getAccountId: () => get().accountId,
    }),
    {
      name: "_cached_token",
      version: 0.1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
// export const useTokenStore = create<ITokenStore>((set, get: any) => ({
//   accountId: "",
//   whitelisted_tokens: [],
//   user_whitelisted_tokens: [],
//   auto_whitelisted_postfix: [],
//   defaultAccountBalances: [],
//   autoAccountBalances: [],
//   get_whitelisted_tokens: () => get().whitelisted_tokens,
//   set_whitelisted_tokens: (whitelisted_tokens: string[]) =>
//     set({ whitelisted_tokens }),
//   get_user_whitelisted_tokens: () => get().user_whitelisted_tokens,
//   set_user_whitelisted_tokens: (user_whitelisted_tokens: string[]) =>
//     set({ user_whitelisted_tokens }),
//   get_auto_whitelisted_postfix: () => get().auto_whitelisted_postfix,
//   set_auto_whitelisted_postfix: (auto_whitelisted_postfix: string[]) =>
//     set({ auto_whitelisted_postfix }),
//   getDefaultAccountBalances: () => get().defaultAccountBalances,
//   setDefaultAccountBalances: (defaultAccountBalances: ITokenMetadata[]) =>
//     set({ defaultAccountBalances }),
//   getAutoAccountBalances: () => get().autoAccountBalances,
//   setAutoAccountBalances: (autoAccountBalances: ITokenMetadata[]) =>
//     set({ autoAccountBalances }),
//   setAccountId: (accountId: string) => set({ accountId }),
//   getAccountId: () => get().accountId,
// }));
