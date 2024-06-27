import { SwapOptions, Transaction } from "@/interfaces/swap";
import { ONE_YOCTO_NEAR } from "@/utils/contract";
import { TokenMetadata } from "@/services/ft-contract";
import { toNonDivisibleNumber, percentLess, round } from "@/utils/numbers";
import { executeMultipleTransactions } from "@/utils/near";
import { getAccountId } from "@/utils/wallet";
import getConfig from "@/utils/config";
import { ftGetStorageBalance } from "@/services/ft-contract";
import { STORAGE_TO_REGISTER_WITH_MFT } from "@/utils/constant";
import { nearDepositTransaction } from "@/services/wrap-near";
import { getTokenUIId } from "@/services/swap/swapUtils";
const { REF_FI_CONTRACT_ID } = getConfig();
const swap = async ({
  tokenIn,
  tokenOut,
  swapsToDo,
  slippageTolerance,
  amountIn,
}: SwapOptions) => {
  return nearInstantSwap({
    tokenIn,
    tokenOut,
    amountIn,
    swapsToDo,
    slippageTolerance,
  });
};

const nearInstantSwap = async ({
  tokenIn,
  tokenOut,
  amountIn,
  swapsToDo,
  slippageTolerance,
}: SwapOptions) => {
  const transactions: Transaction[] = [];
  const accountId = getAccountId();
  const registerToken = async (token: TokenMetadata) => {
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

  //making sure all actions get included.
  await registerToken(tokenOut);
  const actionsList = [];
  const allSwapsTokens = swapsToDo.map((s) => [s.inputToken, s.outputToken]); // to get the hop tokens

  for (const i in allSwapsTokens) {
    const swapTokens = allSwapsTokens[i];
    if (swapTokens[0] == tokenIn.id && swapTokens[1] == tokenOut.id) {
      // direct pool
      actionsList.push({
        pool_id: swapsToDo[i]?.pool?.id,
        token_in: tokenIn.id,
        token_out: tokenOut.id,
        amount_in: swapsToDo[i].partialAmountIn,
        min_amount_out: round(
          tokenOut.decimals,
          toNonDivisibleNumber(
            tokenOut.decimals,
            percentLess(slippageTolerance, swapsToDo[i].estimate)
          )
        ),
      });
    } else if (swapTokens[1] == tokenOut.id) {
      // other hops
      actionsList.push({
        pool_id: swapsToDo[i]?.pool?.id,
        token_in: swapTokens[0],
        token_out: swapTokens[1],
        min_amount_out: round(
          tokenOut.decimals,
          toNonDivisibleNumber(
            tokenOut.decimals,
            percentLess(slippageTolerance, swapsToDo[i].estimate)
          )
        ),
      });
    } else if (swapTokens[0] === tokenIn.id) {
      // first hop
      actionsList.push({
        pool_id: swapsToDo[i]?.pool?.id,
        token_in: swapTokens[0],
        token_out: swapTokens[1],
        amount_in: swapsToDo[i].partialAmountIn,
        min_amount_out: "0",
      });
    } else {
      // middle hop
      actionsList.push({
        pool_id: swapsToDo[i]?.pool?.id,
        token_in: swapTokens[0],
        token_out: swapTokens[1],
        min_amount_out: "0",
      });
    }
  }

  transactions.push({
    receiverId: tokenIn.id,
    functionCalls: [
      {
        methodName: "ft_transfer_call",
        args: {
          receiver_id: REF_FI_CONTRACT_ID,
          amount: toNonDivisibleNumber(tokenIn.decimals, amountIn),
          msg: JSON.stringify({
            force: 0,
            actions: actionsList,
            ...(getTokenUIId(tokenOut) == "near"
              ? { skip_unwrap_near: false }
              : {}),
          }),
        },
        gas: "180000000000000",
        amount: ONE_YOCTO_NEAR,
      },
    ],
  });

  if (getTokenUIId(tokenIn) == "near") {
    transactions.unshift(nearDepositTransaction(amountIn));
  }
  return executeMultipleTransactions(transactions);
};
export default swap;
