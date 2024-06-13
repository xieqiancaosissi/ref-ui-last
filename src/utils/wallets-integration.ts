import { ACCOUNT_ID_KEY } from "../context/WalletSelectorContext";

export enum WALLET_TYPE {
  WEB_WALLET = "near-wallet",
  SENDER_WALLET = "sender-wallet",
}

export const getCurrentWallet = () => {
  const walletInstance = window.selector;

  if (walletInstance) {
    walletInstance.getAccountId = () => {
      return localStorage.getItem(ACCOUNT_ID_KEY) || "";
    };
  }

  return {
    wallet: walletInstance,
    wallet_type: WALLET_TYPE.WEB_WALLET,
  };
};
