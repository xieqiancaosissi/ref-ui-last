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
  const isSignedIn = accountStore.getIsSignedIn();
  useEffect(() => {
    if (txHash && isSignedIn) {
      checkTransaction(txHash)
        .then(async (res: any) => {
          limitOrderPopUp(res, txHash);
        })
        .then(() => {
          router.replace(pathname);
        });
    }
  }, [txHash, isSignedIn]);
};
export default useLimitOrderPopUp;
