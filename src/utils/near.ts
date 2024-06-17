import { Near, keyStores, utils, connect, Contract } from "near-api-js";
import { Transaction as WSTransaction } from "@near-wallet-selector/core";
import BN from "bn.js";
import { getCurrentWallet, getSelector } from "../utils/wallet";
import { Transaction } from "../interfaces/wallet";
import getConfig from "../utils/config";

const config = getConfig();
export const REF_FARM_BOOST_CONTRACT_ID = config.REF_FARM_BOOST_CONTRACT_ID;
export const REF_FI_CONTRACT_ID = config.REF_FI_CONTRACT_ID;
export const REF_UNI_V3_SWAP_CONTRACT_ID = config.REF_UNI_V3_SWAP_CONTRACT_ID;
export const REF_VE_CONTRACT_ID = config.REF_VE_CONTRACT_ID;

export interface RefFiViewFunctionOptions {
  contractId?: string;
  methodName: string;
  args?: object;
}

export interface RefFiFunctionCallOptions extends RefFiViewFunctionOptions {
  gas?: string;
  amount?: string;
}

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
export async function refFarmBoostViewFunction({
  methodName,
  args,
}: {
  contractId?: string;
  methodName: string;
  args?: object;
}) {
  const account = await getAccount();
  return account.viewFunction({
    contractId: REF_FARM_BOOST_CONTRACT_ID,
    methodName,
    args,
  });
}

export async function refSwapV3ViewFunction({
  methodName,
  args,
}: {
  contractId?: string;
  methodName: string;
  args?: object;
}) {
  const account = await getAccount();
  return account.viewFunction({
    contractId: REF_UNI_V3_SWAP_CONTRACT_ID,
    methodName,
    args,
  });
}

export async function refVeViewFunction({
  methodName,
  args,
}: {
  contractId?: string;
  methodName: string;
  args?: object;
}) {
  const account = await getAccount();
  return account.viewFunction({
    contractId: REF_VE_CONTRACT_ID,
    methodName,
    args,
  });
}

export const refFarmBoostFunctionCall = async ({
  methodName,
  args,
  gas,
  amount,
}: RefFiFunctionCallOptions) => {
  const transaction: Transaction = {
    receiverId: REF_FARM_BOOST_CONTRACT_ID,
    functionCalls: [
      {
        methodName,
        args,
        amount,
        gas,
      },
    ],
  };

  return await executeMultipleTransactions([transaction]);
};
