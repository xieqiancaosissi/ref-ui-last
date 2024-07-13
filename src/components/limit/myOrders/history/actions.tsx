import { FormattedMessage } from "react-intl";
import React, { useState, useContext, useMemo, Fragment, useRef } from "react";
import Big from "big.js";
import { ONLY_ZEROS } from "@/utils/numbers";
import { UserOrderInfo } from "@/services/swapV3";
import { HiOutlineExternalLink } from "@/components/reactIcons";
import getConfig from "@/utils/config";
import {
  NearblocksIcon,
  PikespeakIcon,
  TxLeftArrow,
} from "@/components/pools/icon";
export default function Actions({
  order,
  orderTx,
  loadingStates,
  hoveredTx,
  handleTxClick,
  handleMouseEnter,
  handleMouseLeave,
}: {
  order: UserOrderInfo;
  orderTx: string;
  loadingStates: Record<string, any>;
  hoveredTx: string | null;
  handleTxClick: (receipt_id: string, url: string) => void;
  handleMouseEnter: (orderTx: string) => void;
  handleMouseLeave: () => void;
}) {
  return (
    <div className=" col-span-1  text-gray-10  text-xs flex flex-col items-end justify-self-end p-1.5 pr-4">
      <span className="flex text-sm text-white items-center whitespace-nowrap">
        {ONLY_ZEROS.test(order.cancel_amount) ? (
          <FormattedMessage id="filled" defaultMessage={"Filled"} />
        ) : new Big(order.cancel_amount).eq(order.original_deposit_amount) ? (
          <FormattedMessage id="canceled" defaultMessage={"Canceled"} />
        ) : (
          <div className="flex flex-col items-end">
            <span className="whitespace-nowrap mb-0.5">
              <FormattedMessage id="partially" defaultMessage={"Partially"} />
            </span>
            <span className="whitespace-nowrap">
              <FormattedMessage id="filled" defaultMessage={"Filled"} />
            </span>
          </div>
        )}
      </span>

      <div className="relative">
        {!!orderTx && (
          <a
            className="flex items-center text-gray-10 cursor-pointer"
            onMouseEnter={() => handleMouseEnter(orderTx)}
            onMouseLeave={handleMouseLeave}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            {loadingStates[orderTx] ? (
              <>
                Tx
                <span className="loading-dots"></span>
              </>
            ) : (
              <>
                Tx
                <span className="ml-1.5">
                  <HiOutlineExternalLink />
                </span>
              </>
            )}
            {hoveredTx === orderTx && (
              <div className="w-44 absolute top-6 left-0 bg-poolDetaileTxBgColor border border-poolDetaileTxBorderColor rounded-lg p-2 shadow-lg z-50">
                <div className="flex flex-col">
                  <div
                    className="mb-2 px-3 py-2 hover:bg-poolDetaileTxHoverColor text-white rounded-md flex items-center"
                    onMouseEnter={(e) => {
                      const arrow = e.currentTarget.querySelector(
                        ".arrow"
                      ) as HTMLElement;
                      if (arrow) {
                        arrow.style.display = "block";
                      }
                    }}
                    onMouseLeave={(e) => {
                      const arrow = e.currentTarget.querySelector(
                        ".arrow"
                      ) as HTMLElement;
                      if (arrow) {
                        arrow.style.display = "none";
                      }
                    }}
                    onClick={() =>
                      handleTxClick(orderTx, `${getConfig().explorerUrl}/txns`)
                    }
                  >
                    <NearblocksIcon />
                    <p className="ml-2 text-sm">nearblocks</p>
                    <div className="ml-3 arrow" style={{ display: "none" }}>
                      <TxLeftArrow />
                    </div>
                  </div>
                  <div
                    className="px-3 py-2 hover:bg-poolDetaileTxHoverColor text-white rounded-md flex items-center"
                    onMouseEnter={(e) => {
                      const arrow = e.currentTarget.querySelector(
                        ".arrow"
                      ) as HTMLElement;
                      if (arrow) {
                        arrow.style.display = "block";
                      }
                    }}
                    onMouseLeave={(e) => {
                      const arrow = e.currentTarget.querySelector(
                        ".arrow"
                      ) as HTMLElement;
                      if (arrow) {
                        arrow.style.display = "none";
                      }
                    }}
                    onClick={() =>
                      handleTxClick(
                        orderTx,
                        `${getConfig().pikespeakUrl}/transaction-viewer`
                      )
                    }
                  >
                    <PikespeakIcon />
                    <p className="ml-2 text-sm">Pikespeak...</p>
                    <div className="ml-3 arrow" style={{ display: "none" }}>
                      <TxLeftArrow />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </a>
        )}
      </div>
    </div>
  );
}
