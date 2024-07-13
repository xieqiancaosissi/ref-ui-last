import { FormattedMessage } from "react-intl";
import React, { useState } from "react";
import { cancel_order, UserOrderInfo } from "@/services/swapV3";
import { ButtonTextWrapper } from "@/components/common/Button";

export default function Actions({ order }: { order: UserOrderInfo }) {
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);
  return (
    <button
      className={`border col-span-1 rounded-lg xs:text-sm xs:w-full text-xs justify-self-end py-2 px-9 ${
        cancelLoading ? "border border-transparent text-black bg-warn " : ""
      }  border-warn border-opacity-20 text-warn  ${"hover:border hover:border-transparent hover:text-black hover:bg-warn"}`}
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
      />
    </button>
  );
}
