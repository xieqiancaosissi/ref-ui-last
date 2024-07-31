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
