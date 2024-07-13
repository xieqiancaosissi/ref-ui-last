import React from "react";
import { useAccountStore } from "@/stores/account";
import { toRoundedReadableNumber } from "@/utils/numbers";
import { getStablePoolDecimal } from "@/services/swap/swapUtils";
import { usePool } from "@/hooks/usePools";
import { scientificNotationToString } from "@/utils/numbers";
import { useYourliquidity } from "@/hooks/useStableShares";
export default function ShareNumber(props: any) {
  const { id } = props;
  const { shares } = usePool(id);
  const accountStore = useAccountStore();
  const { userTotalShare } = useYourliquidity(id);
  return (
    <div>
      <span className="text-white">
        {accountStore.isSignedIn
          ? toRoundedReadableNumber({
              decimals: getStablePoolDecimal(id),
              number: shares,
              precision: 3,
            })
          : "- "}
      </span>

      <span className={`text-gray-10`}>
        {accountStore.isSignedIn
          ? ` / ${toRoundedReadableNumber({
              decimals: getStablePoolDecimal(id),
              number: scientificNotationToString(
                userTotalShare.toExponential()
              ),
              precision: 3,
            })}`
          : "/ -"}
      </span>
    </div>
  );
}
