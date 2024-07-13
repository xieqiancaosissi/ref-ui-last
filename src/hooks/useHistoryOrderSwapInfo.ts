import { useEffect, useState } from "react";
import { useAccountStore } from "@/stores/account";
import { HistoryOrderSwapInfo } from "@/interfaces/limit";
import { getHistoryOrderSwapInfo } from "@/services/indexer";
const useHistoryOrderSwapInfo = ({
  start_at,
  end_at,
}: {
  start_at: number;
  end_at: number;
}) => {
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();

  const [swapInfo, setSwapInfo] = useState<HistoryOrderSwapInfo[] | null>([]);

  useEffect(() => {
    if (!accountId) return;

    getHistoryOrderSwapInfo(accountId).then((res) => {
      //@ts-ignore
      setSwapInfo(res?.data === null ? [] : res);
    });
  }, [accountId]);

  return (
    swapInfo?.filter(
      (s) => Number(s.timestamp) >= start_at && Number(s.timestamp) <= end_at
    ) || []
  );
};
export default useHistoryOrderSwapInfo;
