import { Transaction } from "../interfaces/wallet";
import getConfig from "../utils/config";
import { getAccount, executeMultipleTransactions } from "./near";

const config = getConfig();
export const REF_FARM_BOOST_CONTRACT_ID = config.REF_FARM_BOOST_CONTRACT_ID;
export const REF_FI_CONTRACT_ID = config.REF_FI_CONTRACT_ID;
export const REF_UNI_V3_SWAP_CONTRACT_ID = config.REF_UNI_V3_SWAP_CONTRACT_ID;
export const REF_VE_CONTRACT_ID = config.REF_VE_CONTRACT_ID;

export const ONE_YOCTO_NEAR = "0.000000000000000000000001";

export interface RefFiViewFunctionOptions {
  contractId?: string;
  methodName: string;
  args?: object;
}

export interface RefFiFunctionCallOptions extends RefFiViewFunctionOptions {
  gas?: string;
  amount?: string;
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
    contractId: REF_VE_CONTRACT_ID as any,
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

export async function refFiViewFunction({
  methodName,
  args,
}: RefFiViewFunctionOptions) {
  const account = await getAccount();
  return account.viewFunction({
    contractId: REF_FI_CONTRACT_ID,
    methodName,
    args,
  });
}
export async function lockerViewFunction({
  methodName,
  args,
}: RefFiViewFunctionOptions) {
  const account = await getAccount();
  return account.viewFunction({
    contractId: config.REF_TOKEN_LOCKER_CONTRACT_ID,
    methodName,
    args,
  });
}

export const nearDepositTransaction = (amount: string) => {
  const transaction: Transaction = {
    receiverId: config.WRAP_NEAR_CONTRACT_ID,
    functionCalls: [
      {
        methodName: "near_deposit",
        args: {},
        gas: "50000000000000",
        amount,
      },
    ],
  };

  return transaction;
};
export const executeFarmMultipleTransactions = async (
  transactions: Transaction[],
  callbackUrl?: string
) => {
  return executeMultipleTransactions(transactions, callbackUrl);
};
