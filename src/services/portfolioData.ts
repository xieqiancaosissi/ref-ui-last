import getOrderlyConfig from "@/utils/orderlyConfig";
import { getAccountId } from "@/utils/wallet";
import {
  Action,
  Transaction as WSTransaction,
} from "@near-wallet-selector/core";

const webWalletIds = ["my-near-wallet", "mintbase-wallet", "bitte-wallet"];
export async function batchDeleteKeys(
  publicKeys: string[],
  callback: (result: any) => void
) {
  const accountId = getAccountId();
  const wallet = await window.selector.wallet();
  const wstransactions: WSTransaction[] = [];
  const actions: Action[] = [];
  publicKeys.forEach((key) => {
    actions.push({
      type: "DeleteKey",
      params: {
        publicKey: key,
      },
    });
  });
  wstransactions.push({
    signerId: accountId,
    receiverId: accountId,
    actions,
  });
  wallet
    .signAndSendTransactions({
      transactions: wstransactions,
    })
    .then((res) => {
      console.log(res);
      callback(res);
      // console.log(res);
      // if (!webWalletIds.includes(wallet.id)) {
      //   window.location.reload();
      // }
    })
    .catch((error) => {
      console.log(error);
      callback(error);
      // if (!webWalletIds.includes(wallet.id)) {
      //   window.location.reload();
      // }
    });
}

export async function batchOrderelyDeleteKeys(
  publicKeys: string[],
  callback: (result: any) => void
) {
  const accountId = getAccountId();
  const wallet = await window.selector.wallet();
  const wstransactions: WSTransaction[] = [];
  const len = 1;
  const transactionsLength = Math.ceil(publicKeys.length / len);
  for (let index = 0; index < transactionsLength; index++) {
    const splitPublicKeys = publicKeys.slice(index * len, index * len + len);
    const actions: Action[] = [];
    splitPublicKeys.forEach((key) => {
      actions.push({
        type: "FunctionCall",
        params: {
          methodName: "user_request_key_removal",
          args: {
            public_key: key,
          },
          gas: "30000000000000",
          deposit: "1",
        },
      });
    });
    wstransactions.push({
      signerId: accountId,
      receiverId: getOrderlyConfig().ORDERLY_ASSET_MANAGER,
      actions,
    });
  }
  wallet
    .signAndSendTransactions({
      transactions: wstransactions,
    })
    .then((res) => {
      callback(res);
    })
    .catch((error) => {
      callback(error);
    });
}
