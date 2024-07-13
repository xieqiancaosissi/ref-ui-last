import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import _ from "lodash";
import { UserOrderInfo } from "@/services/swapV3";
import { IOrderType } from "@/interfaces/limit";
import { isMobile } from "@/utils/device";
const ORDER_TYPE_KEY = "REF_FI_ORDER_TYPE_VALUE";

export default function OrderTab({
  activeOrderList,
  historyOrderList,
  orderType,
  setOrderType,
}: {
  activeOrderList: UserOrderInfo[];
  historyOrderList: UserOrderInfo[];
  orderType: IOrderType;
  setOrderType: (orderType: IOrderType) => void;
}) {
  if (isMobile()) {
    return (
      <div className="frcb w-full">
        <div className="text-white font-gothamBold">
          <FormattedMessage
            id="your_orders"
            defaultMessage={"Your orders"}
          ></FormattedMessage>
        </div>

        <div
          className="flex text-13px p-1 rounded-xl text-white "
          style={{
            border: "1.5px solid rgba(145, 162, 174, 0.2)",
          }}
        >
          <button
            className={`px-3 rounded-lg py-1 ${
              orderType === "active" ? "text-white" : "text-gray-10"
            } `}
            style={{
              background: orderType === "active" ? "#324451" : "",
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              sessionStorage.setItem(ORDER_TYPE_KEY, "active");
              setOrderType("active");
            }}
          >
            <span className="frcs">
              <FormattedMessage id="active" defaultMessage={"Active"} />
              {activeOrderList && activeOrderList.length > 0
                ? ` (${activeOrderList.length})`
                : null}
            </span>
          </button>

          <button
            className={`px-3 py-1 rounded-lg ${
              orderType === "history" ? "text-white" : "text-gray-10"
            } `}
            style={{
              background: orderType === "history" ? "#324451" : "",
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOrderType("history");
              sessionStorage.setItem(ORDER_TYPE_KEY, "history");
            }}
          >
            <span className="frcs">
              <FormattedMessage id="history" defaultMessage={"History"} />
              {historyOrderList && historyOrderList.length > 0
                ? ` (${historyOrderList.length})`
                : null}
            </span>
          </button>
        </div>
      </div>
    );
  }
  const isActive = orderType === "active";
  const isHistory = orderType === "history";
  return (
    <div className="flex whitespace-nowrap  text-white">
      <button
        className={`mr-7  xs:mr-10 flex items-center gap-1.5 font-extrabold text-lg ${
          isActive ? "text-white" : "text-gray-50"
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          sessionStorage.setItem(ORDER_TYPE_KEY, "active");
          setOrderType("active");
        }}
      >
        <span
          className={`${isActive ? " underline" : ""}`}
          style={{ textUnderlineOffset: "12px" }}
        >
          <FormattedMessage
            id="active_orders"
            defaultMessage={"Active Orders"}
          />
        </span>
        <span
          className={`flex items-center justify-center min-w-5 h-5 text-sm text-gray-210 rounded bg-gray-40 px-1 ${
            !isActive ? "opacity-30" : ""
          }`}
        >
          {activeOrderList && activeOrderList.length > 0
            ? `${activeOrderList.length}`
            : null}
        </span>
      </button>

      <button
        className={`flex items-center gap-1.5 font-extrabold text-lg ${
          isHistory ? "text-white" : "text-gray-50"
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOrderType("history");
          sessionStorage.setItem(ORDER_TYPE_KEY, "history");
        }}
      >
        <span
          className={`${isHistory ? " underline" : ""}`}
          style={{ textUnderlineOffset: "12px" }}
        >
          <FormattedMessage id="history" defaultMessage={"History"} />
        </span>
        <span
          className={`flex items-center justify-center min-w-5 h-5 text-sm text-gray-210 rounded bg-gray-40 px-1 ${
            !isHistory ? "opacity-30" : ""
          }`}
        >
          {historyOrderList && historyOrderList.length > 0
            ? `${historyOrderList.length}`
            : null}
        </span>
      </button>
    </div>
  );
}
