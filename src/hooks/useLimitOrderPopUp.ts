import { useEffect } from "react";
import { useRouter } from "next/router";
import { getURLInfo } from "@/utils/transactionsPopup";
import { useAccountStore } from "@/stores/account";
import { checkTransaction } from "@/utils/contract";
import limitOrderPopUp from "@/services/limit/limitOrderPopUp";

const useLimitOrderPopUp = () => {
  const { txHash, pathname } = getURLInfo();
  const router = useRouter();
  const accountStore = useAccountStore();
  const account_id = accountStore.getAccountId();
  const walletLoading = accountStore.getWalletLoading();
  useEffect(() => {
    if (txHash && account_id && !walletLoading) {
      checkTransaction(txHash).then(async (res: any) => {
        await limitOrderPopUp(res, txHash);
        router.replace(pathname);
      });
    }
  }, [txHash, account_id, walletLoading]);
};
export default useLimitOrderPopUp;
