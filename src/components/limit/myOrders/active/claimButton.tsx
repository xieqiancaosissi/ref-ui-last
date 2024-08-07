import React, { useState, useContext, useMemo, Fragment, useRef } from "react";
import { ONLY_ZEROS } from "@/utils/numbers";
import { cancel_order } from "@/services/swapV3";
import { FormattedMessage } from "react-intl";
import { UserOrderInfo } from "@/services/swapV3";
import { ButtonTextWrapper } from "@/components/common/Button";
export default function ClaimButton({
  unClaimedAmount,
  order,
}: {
  unClaimedAmount: string;
  order: UserOrderInfo;
}) {
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  return (
    <button
      className={`rounded border xs:text-sm xs:w-full ml-1.5 lg:h-[32px] lg:text-[13px] lg:w-[90px] xsm:text-sm xsm:flex-grow xsm:h-[38px] ${
        ONLY_ZEROS.test(unClaimedAmount)
          ? "border-dark-190 text-dark-200 cursor-not-allowed opacity-40"
          : `border-green-10 text-green-10`
      }`}
      type="button"
      disabled={ONLY_ZEROS.test(unClaimedAmount)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        setClaimLoading(true);

        cancel_order({
          order_id: order.order_id,
          undecimal_amount: "0",
        });
      }}
    >
      <ButtonTextWrapper
        Text={() => <FormattedMessage id="claim" defaultMessage={"Claim"} />}
        loading={claimLoading}
        loadingColor="#9EFE01"
      ></ButtonTextWrapper>
    </button>
  );
}
