import { useEffect } from "react";
import { getWalletSelector } from "../../utils/wallet-selector";
import { useAccountStore } from "../../stores/account";
export default function WalletInit() {
  const accountStore = useAccountStore();
  useEffect(() => {
    getWalletSelector({ onAccountChange: changeAccount });
  }, []);
  async function changeAccount(accountId: string) {
    accountStore.setAccountId(accountId);
    accountStore.setIsSignedIn(!!accountId);
    accountStore.setWalletLoading(false);
  }

  return null;
}
