import { refFarmBoostViewFunction } from "@/utils/near";
import { getCurrentWallet } from "@/utils/wallets-integration";

export const get_unWithDraw_rewards = async () => {
  const accountId = getCurrentWallet().wallet.getAccountId();
  return await refFarmBoostViewFunction({
    methodName: "list_farmer_rewards",
    args: { farmer_id: accountId },
  });
};
