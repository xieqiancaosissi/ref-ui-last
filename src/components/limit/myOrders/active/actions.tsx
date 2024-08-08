import { FormattedMessage } from "react-intl";
import React, { useState } from "react";
import { cancel_order, UserOrderInfo } from "@/services/swapV3";
import { ButtonTextWrapper } from "@/components/common/Button";

export default function Actions({ order }: { order: UserOrderInfo }) {
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);
  return (
    <button
      className={`border rounded xs:text-sm xs:w-full justify-self-end border-dark-190 text-dark-200 lg:h-[32px] lg:text-[13px] lg:w-[90px] xsm:text-sm xsm:flex-grow xsm:h-[38px]`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setCancelLoading(true);
        cancel_order({
          order_id: order.order_id,
        });
      }}
    >
      <ButtonTextWrapper
        Text={() => <FormattedMessage id="cancel" defaultMessage={"Cancel"} />}
        loading={cancelLoading}
        loadingColor="#BCC9D2"
      />
    </button>
  );
}
