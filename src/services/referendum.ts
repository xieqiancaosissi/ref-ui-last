import { getAccountId } from "../utils/wallet";
import { refVeViewFunction } from "../utils/contract";

export const LOVE_TOKEN_DECIMAL = 18;

export const getLoveAmount = () => {
  return refVeViewFunction({
    methodName: "ft_balance_of",
    args: { account_id: getAccountId() },
  });
};
