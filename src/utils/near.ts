import { keyStores, utils, connect, Contract } from "near-api-js";
import { Transaction as WSTransaction } from "@near-wallet-selector/core";
import BN from "bn.js";
import { getCurrentWallet, getSelector } from "../utils/wallet";
import { Transaction } from "../interfaces/wallet";
import getConfig from "../utils/config";

const config = getConfig();
export const executeMultipleTransactions = async (
  transactions: Transaction[],
  callbackUrl?: string
) => {
  const selector = getSelector();

  const wstransactions: WSTransaction[] = [];

  transactions.forEach((transaction) => {
    wstransactions.push({
      signerId: selector.getAccountId(),
      receiverId: transaction.receiverId,
      actions: transaction.functionCalls.map((fc) => {
        return {
          type: "FunctionCall",
          params: {
            methodName: fc.methodName,
            args: fc.args || {},
            gas: getGas(fc.gas).toNumber().toFixed(),
            deposit: utils.format.parseNearAmount(fc.amount || "0")!,
          },
        };
      }),
    });
  });

  return (await getCurrentWallet())
    .signAndSendTransactions({
      transactions: wstransactions,
      callbackUrl,
    })
    .then(() => {
      console.log();
    })
    .catch((e: Error) => {
      console.log();
    });
};

export const getGas = (gas?: string) =>
  gas ? new BN(gas) : new BN("100000000000000");

export async function getNear() {
  const keyStore = new keyStores.BrowserLocalStorageKeyStore();
  const nearConnection = await connect({ keyStore, ...config });
  return nearConnection;
}

export async function getAccount() {
  const nearConnection = await getNear();
  const account = await nearConnection.account(
    window.accountId || getSelector()?.getAccountId() || ""
  );
  return account;
}

export async function getContractInstance({
  contractId,
  viewMethods,
  changeMethods,
}: {
  contractId: string;
  viewMethods: string[];
  changeMethods: string[];
}) {
  const account = await getAccount();
  const contract = new Contract(account, contractId, {
    viewMethods,
    changeMethods,
  });
  return contract;
}
