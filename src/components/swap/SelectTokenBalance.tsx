import { useMemo } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { toPrecision } from "@/utils/numbers";
import {
  useAccountBalanceTokenStore,
  useAccountTokenStore,
  IAccountTokenStore,
} from "@/stores/token";
import { useAccountStore } from "@/stores/account";
import { ITokenMetadata } from "@/hooks/useBalanceTokens";

interface ISelectTokenBalanceProps {
  token: ITokenMetadata;
  setMaxAmount: () => void;
  isIn?: boolean;
}
export default function SelectTokenBalance(props: ISelectTokenBalanceProps) {
  const { isIn, setMaxAmount, token } = props;
  const { accountId, walletLoading } = useAccountStore();
  const accountBalanceTokenStore = useAccountBalanceTokenStore();
  const accountTokenStore = useAccountTokenStore() as IAccountTokenStore;
  const owner = accountTokenStore.getOwner();
  const defaultBalanceLoading =
    accountBalanceTokenStore.getDefaultBalancesLoading();
  const autoBalanceLoading = accountBalanceTokenStore.getAutoBalancesLoading();
  const loading = useMemo(() => {
    if (walletLoading) return true;
    if (
      !walletLoading &&
      accountId &&
      accountId !== owner &&
      (defaultBalanceLoading || autoBalanceLoading)
    )
      return true;
    return false;
  }, [
    walletLoading,
    accountId,
    owner,
    defaultBalanceLoading,
    autoBalanceLoading,
  ]);
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
          {toPrecision(token?.balance || "0", 3)}
        </span>
      )}
    </>
  );
}
