import { nearSwapOptions, Transaction } from "@/interfaces/swap";
import { TokenMetadata } from "@/services/ft-contract";
import { executeMultipleTransactions } from "@/utils/near";
import { getAccountId } from "@/utils/wallet";
import { ftGetStorageBalance } from "@/services/ft-contract";
import { STORAGE_TO_REGISTER_WITH_MFT } from "@/utils/constant";
import { getTokenUIId } from "@/services/swap/swapUtils";
import {
  nearDepositTransaction,
  nearWithdrawTransaction,
} from "@/services/wrap-near";

const nearSwap = async ({ tokenIn, tokenOut, amountIn }: nearSwapOptions) => {
  const transactions: Transaction[] = [];
  const accountId = getAccountId();
  const registerToken = async (token: TokenMetadata) => {
    if (getTokenUIId(tokenOut) == "near") return;
    const tokenRegistered = await ftGetStorageBalance(token.id).catch(() => {
      throw new Error(`${token.id} doesn't exist.`);
    });

    if (tokenRegistered === null) {
      transactions.push({
        receiverId: token.id,
        functionCalls: [
          {
            methodName: "storage_deposit",
            args: {
              registration_only: true,
              account_id: accountId,
            },
            gas: "30000000000000",
            amount: STORAGE_TO_REGISTER_WITH_MFT,
          },
        ],
      });
    }
  };
  await registerToken(tokenOut);
  if (getTokenUIId(tokenIn) == "near") {
    transactions.push(nearDepositTransaction(amountIn));
  } else {
    transactions.push(nearWithdrawTransaction(amountIn));
  }

  return executeMultipleTransactions(transactions);
};
export default nearSwap;
