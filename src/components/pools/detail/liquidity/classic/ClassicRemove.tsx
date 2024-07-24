import React, { useEffect, useState, useMemo, useCallback } from "react";
import Modal from "react-modal";
import { RemoveLiqTitleIcon } from "../icon";
import { LpModalCloseIcon } from "@/components/pools/icon";
import { Icon } from "../IconCom";
import { ftGetBalance } from "@/services/token";
import { toReadableNumber } from "@/utils/numbers";
import _ from "lodash";
import { useAccountStore } from "@/stores/account";
import poolStyle from "./index.module.css";
import { feeList } from "./config";
import HoverTip from "@/components/common/Tips";
import BigNumber from "bignumber.js";
import { percent, toPrecision } from "@/utils/numbers";
import { RATED_POOL_LP_TOKEN_DECIMALS } from "@/utils/constant";
import { ButtonTextWrapper } from "@/components/common/Button";
import { toNonDivisibleNumber } from "@/utils/numbers";
import { usePool } from "@/hooks/usePools";
import { toInternationalCurrencySystem } from "@/utils/numbers";
import { useRemoveLiquidity } from "@/hooks/usePools";
import { useIntl } from "react-intl";

export const REF_FI_PRE_LIQUIDITY_ID_KEY = "REF_FI_PRE_LIQUIDITY_ID_VALUE";

export function myShares({
  totalShares,
  userTotalShare,
}: {
  totalShares: string;
  userTotalShare: BigNumber;
}) {
  const sharePercent = percent(userTotalShare.valueOf(), totalShares);

  const displayUserTotalShare = userTotalShare
    .toNumber()
    .toLocaleString("fullwide", { useGrouping: false });

  let displayPercent;
  if (Number(sharePercent) > 0 && Number(sharePercent) < 0.001) {
    displayPercent = "< 0.001";
  } else displayPercent = toPrecision(String(sharePercent), 3);

  const nonPrecisionDisplayUserTotalShares = toReadableNumber(
    RATED_POOL_LP_TOKEN_DECIMALS,
    displayUserTotalShare
  );

  const inPrecisionDisplayUserTotalShares =
    Number(nonPrecisionDisplayUserTotalShares) > 0 &&
    Number(nonPrecisionDisplayUserTotalShares) < 0.001
      ? "< 0.001"
      : toPrecision(nonPrecisionDisplayUserTotalShares, 3);

  return inPrecisionDisplayUserTotalShares + " " + `(${displayPercent}%)`;
}

export default function StableAdd(props: any) {
  const accountStore = useAccountStore();
  const intl = useIntl();

  const { isOpen, onRequestClose, poolDetail, pureIdList, updatedMapList } =
    props;

  useEffect(() => {
    const array = new Array(
      updatedMapList[0]?.token_account_ids?.length || 2
    ).fill("");
  }, [updatedMapList[0]?.token_account_ids]);

  const originalSendSearchValue = (e: any) => {
    // setSearchValue(e.target.value);
  };

  const debouncedSendSearchValue = _.debounce(originalSendSearchValue, 10);

  //

  const [isActive, setActive] = useState(0.5);
  const [feeValue, setFeeValue] = useState(isActive);

  const [canSubmit, setCanSubmit] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  function submit() {
    const amountBN = new BigNumber(shareVal?.toString());
    const shareBN = new BigNumber(toReadableNumber(24, shares));
    if (Number(shareVal) === 0) {
      throw new Error(
        intl.formatMessage({ id: "must_input_a_value_greater_than_zero" })
      );
    }
    if (amountBN.isGreaterThan(shareBN)) {
      throw new Error(
        intl.formatMessage({
          id: "input_greater_than_available_shares",
        })
      );
    }
    localStorage.setItem(REF_FI_PRE_LIQUIDITY_ID_KEY, poolDetail.id.toString());
    return removeLiquidity();
  }
  // tab change
  const [removeTabActive, setRemoveTabActive] = useState("share");

  // by share
  const { shares } = usePool(poolDetail.id);
  const sharesDecimals = toReadableNumber(24, shares);
  const [shareVal, setShareVal] = useState("0");
  const changeShareVal = (val: any) => {
    setCanSubmit(true);
    if (+val > +sharesDecimals) {
      setCanSubmit(false);
    }
    setShareVal(val ? val : "0");
  };
  const { minimumAmounts, removeLiquidity } = useRemoveLiquidity({
    pool: updatedMapList[0],
    slippageTolerance: feeValue,
    shares: shareVal ? toNonDivisibleNumber(24, shareVal) : "0",
  });

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          overflow: "auto",
        },
        content: {
          outline: "none",
          transform: "translate(-50%, -50%)",
        },
      }}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <RemoveLiqTitleIcon />
          <LpModalCloseIcon
            className="cursor-pointer hover:opacity-90"
            onClick={onRequestClose}
          />
        </div>

        <div className="flex flex-col justify-between w-108 min-h-84 rounded-lg bg-dark-10 px-4 py-5">
          {/*  */}
          {removeTabActive == "share" && (
            <div>
              <div>
                <div className="flex items-center justify-between text-gray-50 mb-2 text-sm">
                  <span>Available LP Tokens</span>
                  <span
                    className={`underline hover:cursor-pointer hover:text-white ${
                      shareVal >= sharesDecimals
                        ? "text-green-10"
                        : "text-gray-50"
                    }`}
                    onClick={() => changeShareVal(sharesDecimals)}
                  >
                    Max
                  </span>
                </div>
                <div
                  className="flex h-16 w-full items-center border border-transparent hover:border-green-20 rounded"
                  style={{ background: "rgba(0,0,0,.2)" }}
                >
                  <input
                    type="number"
                    className="h-16 p-3 w-full text-white"
                    style={{ fontSize: "26px" }}
                    placeholder="0"
                    value={shareVal}
                    onChange={(e) => {
                      changeShareVal(e.target.value);
                    }}
                  />
                </div>
              </div>

              {/* slippage */}
              <div className="flex items-center justify-between mt-7">
                <div className="text-sm text-gray-50 frcc">
                  Slippage tolerance{" "}
                  <HoverTip
                    msg={
                      "Slippage means the difference between what you expect to get and what you actually get due to other executing first"
                    }
                    extraStyles={"w-50"}
                  />
                </div>
                <div className="frcc">
                  <div
                    className={`frcc w-38 text-sm py-1  ${poolStyle.commonStyle}`}
                  >
                    {feeList.map((item, index) => {
                      return (
                        <div
                          key={item.key + index}
                          className={`
                  ${
                    isActive == item.key
                      ? "text-white bg-gray-120 rounded"
                      : "text-gray-60"
                  }
                  w-12 h-5 frcc cursor-pointer
                `}
                          onClick={() => {
                            setActive(item.key);
                            setFeeValue(item.key);
                          }}
                        >
                          {item.value}%
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-50 frcc">
                  Minimum received
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between">
                {updatedMapList[0]?.token_account_ids?.map(
                  (ite: any, ind: number) => {
                    return (
                      <>
                        <div
                          key={ite.tokenId}
                          className="flex h-13 mt-2 p-2 w-45 shrink-0 items-center rounded"
                          style={{ background: "rgba(33, 43, 53, 0.4)" }}
                        >
                          <Icon icon={ite.icon} className="h-7 w-7 mr-2" />
                          <span className="text-gray-50 text-base">
                            {ite.symbol}
                          </span>
                          <span className="text-base text-white ml-2">
                            {toInternationalCurrencySystem(
                              toPrecision(
                                toReadableNumber(
                                  ite.decimals,
                                  minimumAmounts[ite.id]
                                ),
                                4
                              ),
                              4
                            )}
                          </span>
                        </div>
                        <span className="text-gray-50 text-lg">
                          {ind < updatedMapList[0]?.token_account_ids.length - 1
                            ? "+"
                            : ""}
                        </span>
                      </>
                    );
                  }
                )}
              </div>
            </div>
          )}
          <div>
            {!canSubmit && (
              <div
                className="text-yellow-10 text-sm border h-11 w-full rounded flex px-2 py-1 items-center mb-2"
                style={{
                  borderColor: "rgba(230, 180, 1, 0.3)",
                  backgroundColor: "rgba(230, 180, 1, 0.14)",
                }}
              >
                <span>{` Input greater than available shares`}</span>
              </div>
            )}

            {/* submit */}
            {accountStore.isSignedIn ? (
              canSubmit && +shareVal > 0 ? (
                <div
                  className="poolBtnStyleActiveEmpty h-11 mt-2  cursor-pointer hover:opacity-90"
                  onClick={() => {
                    setIsLoading(true);
                    submit();
                  }}
                >
                  <ButtonTextWrapper
                    loading={isLoading}
                    Text={() => <span>Remove Liquidity</span>}
                  />
                </div>
              ) : (
                <div className="poolBtnStyleDisable h-11 mt-2 cursor-not-allowed">
                  Remove Liquidity
                </div>
              )
            ) : (
              <div
                className="poolBtnStyleDefaultBase h-11 mt-2 cursor-pointer hover:opacity-90"
                onClick={() => window.modal.show()}
              >
                Connect Wallet
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
