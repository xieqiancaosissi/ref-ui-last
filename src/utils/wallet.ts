import type { Wallet } from "@near-wallet-selector/core";

export function getSelector() {
  return window.selector;
}
export async function getCurrentWallet(): Promise<Wallet> {
  return await window.selector?.wallet();
}
export function getAccountId() {
  return window.accountId;
}

export const ledgerTipTrigger = async (wallet: any) => {
  const handlePopTrigger = () => {
    const el = document.getElementsByClassName(
      "ledger-transaction-pop-up"
    )?.[0];
    if (el) {
      el.setAttribute("style", "display:flex");
    }
  };

  const isLedger = wallet === "ledger";

  if (isLedger) {
    handlePopTrigger();
  }
};

export function addQueryParams(
  baseUrl: string,
  queryParams: {
    [name: string]: string;
  }
) {
  const url = new URL(baseUrl);
  for (const key in queryParams) {
    const param = queryParams[key];
    if (param) url.searchParams.set(key, param);
  }
  return url.toString();
}
