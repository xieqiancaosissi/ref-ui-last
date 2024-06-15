import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useSwapStore = create(
  persist(
    (set, get: any) => ({
      smartRoute: true,
      getSmartRoute: () => get().smartRoute,
      setSmartRoute: (smartRoute: boolean) => {
        set({
          smartRoute,
        });
      },
    }),
    {
      name: "_cached_swap",
      version: 0.1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
