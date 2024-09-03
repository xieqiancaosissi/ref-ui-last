import { UserSeedInfo } from "@/services/farm";
import React, { createContext } from "react";
export interface FarmsContextType {
  user_data: {
    user_seeds_map?: Record<string, UserSeedInfo>;
    user_unclaimed_token_meta_map?: Record<string, any>;
    user_unclaimed_map?: Record<string, any>;
  };
  init?: () => void;
  getConfig?: () => void;
  get_user_unWithDraw_rewards?: () => void;
  get_user_seeds_and_unClaimedRewards?: () => void;
}
const FarmsContextData = createContext<FarmsContextType | null>(null);
export { FarmsContextData };
