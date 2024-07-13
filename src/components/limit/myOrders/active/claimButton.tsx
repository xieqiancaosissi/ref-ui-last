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
      className={`rounded-lg text-xs xs:text-sm xs:w-full ml-1.5 mr-2 py-2 px-9 ${
        ONLY_ZEROS.test(unClaimedAmount)
          ? "text-gray-10 cursor-not-allowe bg-black opacity-20 cursor-not-allowed"
          : `text-white bg-blue-10 hover:text-white hover:bg-deepBlueHover ${
              claimLoading ? " text-white bg-deepBlueHover " : ""
            }`
      }`}
      type="button"
      disabled={ONLY_ZEROS.test(unClaimedAmount)}
      // disabled
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        setClaimLoading(true);

        cancel_order({
          order_id: order.order_id,
          undecimal_amount: "0",
        });
      }}
      style={{
        height: "34px",
      }}
    >
      <ButtonTextWrapper
        Text={() => <FormattedMessage id="claim" defaultMessage={"Claim"} />}
        loading={claimLoading}
      ></ButtonTextWrapper>
    </button>
  );
}
