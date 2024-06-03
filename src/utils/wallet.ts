import type { Wallet } from "@near-wallet-selector/core";

export function getSelector() {
  return window.selector;
}
export async function getCurrentWallet(): Promise<Wallet> {
  return await window.selector?.wallet();
}
