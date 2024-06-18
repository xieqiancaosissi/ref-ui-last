import {
  getAccountId,
  getCurrentWallet,
  ledgerTipTrigger,
  addQueryParams,
} from "@/utils/wallet";
import { utils } from "near-api-js";
import BN from "bn.js";

export enum TRANSACTION_WALLET_TYPE {
  NEAR_WALLET = "transactionHashes",
  SENDER_WALLET = "transactionHashesSender",
  WalletSelector = "transactionHashesWallets",
}

export const extraWalletsError = [
  "Couldn't open popup window to complete wallet action",
];

export const walletsRejectError = [
  "User reject",
  "User rejected the signature request",
  "Invalid message. Only transactions can be signed",
  "Ledger device: Condition of use not satisfied (denied by the user?) (0x6985)",
  "User cancelled the action",
  "User closed the window before completing the action",
];

export const getGas = (gas?: string) =>
  gas ? new BN(gas) : new BN("100000000000000");
export const executeMultipleTransactions = async (
  transactions: any[],
  callbackUrl?: string
) => {
  const wstransactions: any[] = [];

  transactions.forEach((transaction) => {
    wstransactions.push({
      signerId: getAccountId()!,
      receiverId: transaction.receiverId,
      actions: transaction.functionCalls.map((fc: any) => {
        return {
          type: "FunctionCall",
          params: {
            methodName: fc.methodName,
            args: fc.args,
            gas: getGas(fc.gas).toNumber().toFixed(),
            deposit: utils.format.parseNearAmount(fc.amount || "0")!,
          },
        };
      }),
    });
  });

  await ledgerTipTrigger(getCurrentWallet());

  return (await getCurrentWallet())
    .signAndSendTransactions({
      transactions: wstransactions,
      callbackUrl,
    })
    .then((res) => {
      if (!res) return;

      const transactionHashes = (Array.isArray(res) ? res : [res])?.map(
        (r) => r.transaction.hash
      );
      const parsedTransactionHashes = transactionHashes?.join(",");
      const newHref = addQueryParams(
        window.location.origin + window.location.pathname,
        {
          [TRANSACTION_WALLET_TYPE.WalletSelector]: parsedTransactionHashes,
        }
      );

      window.location.href = newHref;
    })
    .catch((e: Error) => {
      if (extraWalletsError.includes(e.message)) {
        return;
      }

      if (
        !walletsRejectError.includes(e.message) &&
        !extraWalletsError.includes(e.message)
      ) {
        sessionStorage.setItem("WALLETS_TX_ERROR", e.message);
      }

      window.location.reload();
    });
};
