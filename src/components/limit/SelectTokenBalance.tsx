import { useMemo } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { toPrecision } from "@/utils/numbers";
import { useAccountStore } from "@/stores/account";
import { ITokenMetadata } from "@/interfaces/tokens";
import { useLimitStore } from "@/stores/limitOrder";

interface ISelectTokenBalanceProps {
  token: ITokenMetadata;
  setMaxAmount: () => void;
  isIn?: boolean;
}
export default function SelectTokenBalance(props: ISelectTokenBalanceProps) {
  const { isIn, setMaxAmount, token } = props;
  const accountStore = useAccountStore();
  const walletLoading = accountStore.getWalletLoading();
  const accountId = accountStore.getAccountId();
  const limitStore = useLimitStore();
  const balanceLoading = limitStore.getBalanceLoading();
  const loading = useMemo(() => {
    return walletLoading || balanceLoading;
  }, [walletLoading, balanceLoading]);
  return (
    <>
      {loading ? (
        <SkeletonTheme
          baseColor="rgba(33, 43, 53, 0.5)"
          highlightColor="rgba(42, 54, 67, 0.5)"
        >
          <Skeleton height={14} width={30} />
        </SkeletonTheme>
      ) : (
        <span
          onClick={() => {
            if (isIn) setMaxAmount();
          }}
          className={`${isIn ? "underline cursor-pointer" : ""}`}
        >
          {toPrecision(token?.balance || (accountId ? "0" : "-"), 3)}
        </span>
      )}
    </>
  );
}
