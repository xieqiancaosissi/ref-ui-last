import { keyStores, utils, connect, Contract } from "near-api-js";
import { Transaction as WSTransaction } from "@near-wallet-selector/core";
import BN from "bn.js";
import { getCurrentWallet } from "../utils/wallet";
import { Transaction } from "../interfaces/wallet";
import getConfig from "../utils/config";
import { getSelectedWalletId } from "../utils/wallet";
const config = getConfig();
const webWalletIds = ["my-near-wallet", "mintbase-wallet"];
export const executeMultipleTransactions = async (
  transactions: Transaction[],
  callbackUrl?: string
) => {
  const wstransactions: WSTransaction[] = [];

  transactions.forEach((transaction) => {
    wstransactions.push({
      signerId: window.accountId,
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
  const selectedWalletId = getSelectedWalletId();
  return (await getCurrentWallet())
    .signAndSendTransactions({
      transactions: wstransactions,
      callbackUrl,
    })
    .then(() => {
      if (!webWalletIds.includes(selectedWalletId)) {
        window.location.reload();
      }
    })
    .catch((e: Error) => {
      if (!webWalletIds.includes(selectedWalletId)) {
        window.location.reload();
      }
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
  const account = await nearConnection.account(window.accountId || "");
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
    useLocalViewExecution: true,
  });
  return contract;
}

export async function viewFunction(viewArg: {
  contractId: string;
  methodName: string;
  args?: object;
}) {
  const account = await getAccount();
  return await account.viewFunction(viewArg);
}
/***************************Do not insert other functions in this file (Lily and Luk)e*******************************/
/***************************Do not insert other functions in this file (Lily and Luk)e*******************************/
/***************************Do not insert other functions in this file (Lily and Luk)e*******************************/
/***************************Do not insert other functions in this file (Lily and Luk)e*******************************/
/***************************Do not insert other functions in this file (Lily and Luk)e*******************************/
