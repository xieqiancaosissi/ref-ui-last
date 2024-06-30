import { useEffect } from "react";
import { useRouter } from "next/router";
import { getURLInfo, getErrorMessage } from "@/utils/transactionsPopup";
import { useAccountStore } from "@/stores/account";
import { checkTransaction } from "@/utils/contract";
import swapToast from "@/services/swap/swapToast";
import swapFailToast from "@/services/swap/swapFailToast";

const useSwapPopUp = () => {
  const { txHash, pathname, errorType } = getURLInfo();
  const router = useRouter();
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.getIsSignedIn();
  useEffect(() => {
    if (txHash && isSignedIn) {
      checkTransaction(txHash)
        .then(async (res: any) => {
          const transactionErrorType = getErrorMessage(res);
          const byNeth =
            res?.transaction?.actions?.[0]?.FunctionCall?.method_name ===
            "execute";

          const transaction = res.transaction;
          const isSwapNeth =
            res?.receipts?.[0]?.receipt?.Action?.actions?.[0]?.FunctionCall
              ?.method_name === "ft_transfer_call" ||
            res?.receipts?.[0]?.receipt?.Action?.actions?.[0]?.FunctionCall
              ?.method_name === "near_withdraw";
          return {
            isSwap:
              transaction?.actions[1]?.FunctionCall?.method_name ===
                "ft_transfer_call" ||
              transaction?.actions[0]?.FunctionCall?.method_name ===
                "ft_transfer_call" ||
              transaction?.actions[0]?.FunctionCall?.method_name === "swap" ||
              transaction?.actions[0]?.FunctionCall?.method_name ===
                "near_deposit" ||
              transaction?.actions[0]?.FunctionCall?.method_name ===
                "near_withdraw" ||
              (isSwapNeth && byNeth),
            transactionErrorType,
          };
        })
        .then(({ isSwap, transactionErrorType }) => {
          if (isSwap) {
            !transactionErrorType && !errorType && swapToast(txHash);
            transactionErrorType && swapFailToast(txHash, transactionErrorType);
          }
          router.replace(pathname);
        });
    }
  }, [txHash, isSignedIn]);
};
export default useSwapPopUp;
