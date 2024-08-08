import React, { useEffect, useState, useMemo, useCallback } from "react";
import Modal from "react-modal";
import { RemoveLiqTitleIcon } from "../icon";
import { LpModalCloseIcon } from "@/components/pools/icon";
import tokenIcons from "@/utils/tokenIconConfig";
import { TokenIconComponent } from "@/components/pools/TokenIconWithTkn";
import { Icon } from "../IconCom";
import { ftGetBalance, ftGetTokenMetadata } from "@/services/token";
import { toReadableNumber } from "@/utils/numbers";
import _ from "lodash";
import { disPlayBalance } from "@/utils/uiNumber";
import { useAccountStore } from "@/stores/account";
import poolStyle from "./index.module.css";
import { feeList } from "./config";
import HoverTip from "@/components/common/Tips";
import BigNumber from "bignumber.js";
import { percent, toPrecision } from "@/utils/numbers";
import { RATED_POOL_LP_TOKEN_DECIMALS } from "@/utils/constant";
import { percentLess } from "@/utils/numbers";
import { usePredictShares } from "@/hooks/useStableLiquidity";
import { ButtonTextWrapper } from "@/components/common/Button";
import { toNonDivisibleNumber } from "@/utils/numbers";
import { addLiquidityToStablePool } from "@/services/pool";
import { removeTab } from "./config";
import { usePool } from "@/hooks/usePools";
import { toRoundedReadableNumber } from "@/utils/numbers";
import { getStablePoolDecimal } from "@/services/swap/swapUtils";
import RangeSlider from "./StableRemoveRangeSlider";
import { LP_TOKEN_DECIMALS } from "@/services/m-token";
import { getRemoveLiquidityByShare } from "@/hooks/useStableShares";
import { TokenMetadata } from "@/services/ft-contract";
import { usePredictRemoveShares } from "@/hooks/usePools";
import { percentIncrese } from "@/utils/numbers";
import {
  removeLiquidityFromStablePool,
  removeLiquidityByTokensFromStablePool,
} from "@/services/pool";
import { useAppStore } from "@/stores/app";
import { showWalletSelectorModal } from "@/utils/wallet";

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
  const appStore = useAppStore();
  const {
    isOpen,
    onRequestClose,
    poolDetail,
    pureIdList,
    updatedMapList,
    isMobile,
  } = props;
  const [balancesList, setBalances] = useState<any>([]);
  const [inputValList, setInputValList] = useState<any>([]);

  const returnBalance = async (token: any) => {
    try {
      const data = await ftGetBalance(token.tokenId);
      const balance = toReadableNumber(token.decimals, data);
      return { balance, id: token.tokenId, symbol: token.symbol };
    } catch (error) {
      console.error("error getting balance:", error);
    }
  };

  useEffect(() => {
    const array = new Array(
      updatedMapList[0]?.token_account_ids?.length || 2
    ).fill("");
    setInputValList(array);
  }, [updatedMapList[0]?.token_account_ids]);

  const changeVal = useCallback((e: any, ind: number) => {
    setInputValList((prev: string[]) => {
      const newValues = [...prev];
      newValues[ind] = e.target.value;
      return newValues;
    });
    debouncedSendSearchValue(e);
  }, []);

  const originalSendSearchValue = (e: any) => {
    // setSearchValue(e.target.value);
  };

  const debouncedSendSearchValue = _.debounce(originalSendSearchValue, 10);

  //

  const [isActive, setActive] = useState(0.1);
  const [feeValue, setFeeValue] = useState(isActive);
  const inputChange = (e: any) => {
    if (e.target.value >= 20) {
      setFeeValue(20);
    } else {
      setFeeValue(e.target.value);
    }
    setActive(e.target.value);
  };

  const predicedShares = usePredictShares({
    poolId: poolDetail.id,
    tokenAmounts: [...inputValList],
    stablePool: updatedMapList[0],
  });

  const [canSubmit, setCanSubmit] = useState(false);
  const [notEnoughList, setNotEnoughList] = useState([]);

  useEffect(() => {
    let flag: boolean = true;
    const k: any = [];
    inputValList.map((item: any, index: number) => {
      if (+item > balancesList[index]?.balance || +item <= 0) {
        flag = false;
        k.push(balancesList[index]?.symbol);
      }
    });
    console.log(inputValList, "inputValList");
    setCanSubmit(flag);
    setNotEnoughList(k);
  }, [inputValList]);

  const [isLoading, setIsLoading] = useState(false);

  function submit() {
    if (removeTabActive == "share") {
      const removeShares = toNonDivisibleNumber(
        RATED_POOL_LP_TOKEN_DECIMALS,
        shareVal
      );

      const min_amounts = receiveAmounts.map((amount, i) =>
        toNonDivisibleNumber(
          updatedMapList[0].token_account_ids[i].decimals,
          percentLess(
            feeValue,

            toReadableNumber(
              updatedMapList[0].token_account_ids[i].decimals,
              amount
            )
          )
        )
      );

      return removeLiquidityFromStablePool({
        tokens: updatedMapList[0].token_account_ids,
        id: +poolDetail.id,
        min_amounts: min_amounts as [string, string, string],
        shares: removeShares,
      });
    } else {
      const amounts = [...inputValList].map((amount, i) => {
        return toNonDivisibleNumber(
          updatedMapList[0].token_account_ids[i].decimals,
          amount
        );
      }) as Array<string>;
      const predict_burn = toPrecision(
        percentIncrese(feeValue, predictedRemoveShares),
        0
      );

      const max_burn_shares = new BigNumber(predict_burn).isGreaterThan(shares)
        ? shares
        : predict_burn;

      return removeLiquidityByTokensFromStablePool({
        tokens: updatedMapList[0].token_account_ids,
        id: +poolDetail.id,
        amounts,
        max_burn_shares,
      });
    }
  }
  // tab change
  const [removeTabActive, setRemoveTabActive] = useState("share");

  // by share
  const { shares } = usePool(poolDetail.id);
  const sharesDecimals = toRoundedReadableNumber({
    decimals: getStablePoolDecimal(poolDetail.id),
    number: shares,
    precision: 12 || String(shares).length,
  });
  const [shareVal, setShareVal] = useState("0");
  const changeShareVal = (val: any) => {
    if (+val > +sharesDecimals || val <= 0) {
      setCanSubmit(false);
    } else {
      setCanSubmit(true);
    }

    setShareVal(val ? val : "0");
  };
  const [receiveAmounts, setReceiveAmounts] = useState(new Array(4).fill(""));
  useEffect(() => {
    // setCanSubmitByShare(true);
    const readableShares = toReadableNumber(
      RATED_POOL_LP_TOKEN_DECIMALS,
      shares
    );

    const shareParam = toNonDivisibleNumber(
      RATED_POOL_LP_TOKEN_DECIMALS,
      shareVal
    );

    if (Number(shareVal) === 0 || Number(shareVal) > Number(readableShares)) {
      // setCanSubmitByShare(false);
      setReceiveAmounts(["0", "0", "0", "0"]);
      return;
    }
    // setCanSubmitByShare(false);

    const receiveAmounts = getRemoveLiquidityByShare(
      shareParam,
      updatedMapList[0]
    );
    const parsedAmounts = receiveAmounts.map((amount: any, i: number) =>
      toRoundedReadableNumber({
        decimals:
          LP_TOKEN_DECIMALS - updatedMapList[0].token_account_ids[i].decimals,
        number: amount,
        precision: 0,
        withCommas: false,
      })
    );

    setReceiveAmounts(parsedAmounts);
  }, [updatedMapList[0].token_account_ids, shareVal]);

  const calcTokenReceived = (receiveAmount: string, token: TokenMetadata) => {
    const nonPrecisionAmount = percentLess(
      feeValue,
      toReadableNumber(token.decimals, receiveAmount)
    );

    return Number(nonPrecisionAmount) < 0.001 && Number(nonPrecisionAmount) > 0
      ? "< 0.001"
      : toPrecision(nonPrecisionAmount, 3);
  };

  // by tokens
  const [error, setError]: any = useState(null);
  const { predictedRemoveShares, canSubmitByToken } = usePredictRemoveShares({
    amounts: [...inputValList],
    setError,
    shares,
    stablePool: updatedMapList[0],
  });

  const calcSharesRemoved = () => {
    const nonPrecisionValue = percentIncrese(
      feeValue,
      toReadableNumber(RATED_POOL_LP_TOKEN_DECIMALS, predictedRemoveShares)
    );

    const myReadableShare = toReadableNumber(
      RATED_POOL_LP_TOKEN_DECIMALS,
      shares
    );
    if (error) return "0";

    return Number(nonPrecisionValue) > 0 && Number(nonPrecisionValue) < 0.001
      ? "< 0.001"
      : new BigNumber(nonPrecisionValue).isGreaterThan(
          new BigNumber(myReadableShare)
        )
      ? toPrecision(myReadableShare, 3)
      : toPrecision(nonPrecisionValue, 3);
  };

  const closeInit = () => {
    const array = new Array(
      updatedMapList[0]?.token_account_ids?.length || 2
    ).fill("");
    setInputValList(array);
    setFeeValue(0.1);
    setActive(0.1);
    changeShareVal(0);
    setCanSubmit(false);
  };
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {
        onRequestClose();
        closeInit();
      }}
      style={{
        overlay: {
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          overflow: "auto",
        },
        content: {
          outline: "none",
          top: isMobile ? "auto" : "50%",
          left: isMobile ? "auto" : "50%",
          transform: isMobile ? "none" : "translate(-50%, -50%)",
          bottom: isMobile ? "32px" : "auto",
          width: isMobile ? "100%" : "auto",
        },
      }}
    >
      <div>
        <div className="flex items-center justify-between mb-4 xsm:hidden">
          <RemoveLiqTitleIcon />
          <LpModalCloseIcon
            className="cursor-pointer hover:opacity-90"
            onClick={() => {
              onRequestClose();
              closeInit();
            }}
          />
        </div>

        <div className="lg:w-108 xsm:w-full min-h-123 rounded-lg bg-dark-10 px-4 py-5">
          <div className="lg:hidden text-white font-medium text-lg mb-6">
            Remove Liquidity
          </div>
          {/* tab */}
          <div className="w-full bg-dark-10 h-11 frcc rounded border border-gray-40 p-1 mb-5">
            {removeTab.map((item: any, index: number) => {
              return (
                <div
                  key={item.key + "_" + index + Math.random()}
                  onClick={() => setRemoveTabActive(item.key)}
                  className={`frcc text-base font-bold h-full flex-1 rounded cursor-pointer ${
                    item.key == removeTabActive
                      ? "text-white bg-gray-40"
                      : "text-gray-50 bg-transparent"
                  }`}
                >
                  {item.value}
                  <HoverTip msg={item.tips} extraStyles={"w-45"} />
                </div>
              );
            })}
          </div>
          {/*  */}
          {removeTabActive == "share" && (
            <div>
              <div>
                <div className="flex items-center justify-between text-gray-50 mb-2 text-sm">
                  <span>Shares</span>
                  <span
                    className={`underline hover:cursor-pointer  ${
                      shareVal >= sharesDecimals
                        ? "text-green-10 "
                        : "text-gray-50"
                    }`}
                    onClick={() => changeShareVal(sharesDecimals)}
                  >
                    Max
                  </span>
                </div>
                <div
                  className={`flex h-16 w-full items-center border border-transparent  rounded hover:border-green-20`}
                  style={{ background: "rgba(0,0,0,.2)" }}
                >
                  <input
                    type="number"
                    className={`h-16 p-3 w-full ${
                      +sharesDecimals > 0 ? "text-white" : "text-gray-50"
                    }`}
                    style={{ fontSize: "26px" }}
                    placeholder="0"
                    disabled={+sharesDecimals <= 0}
                    value={shareVal}
                    onChange={(e) => {
                      changeShareVal(e.target.value);
                    }}
                  />
                </div>
              </div>
              <RangeSlider
                sliderAmount={shareVal}
                setSliderAmount={changeShareVal}
                max={sharesDecimals}
                // setAmount={changeVal}
              ></RangeSlider>

              {/* slippage */}
              <div className="flex items-center justify-between mt-12">
                <div className="text-sm text-gray-50 frcc">
                  Slippage tolerance{" "}
                  <HoverTip
                    msg={
                      "Slippage means the difference between what you expect to get and what you actually get due to other executing first"
                    }
                    extraStyles={"w-50"}
                  />
                </div>
                <div className="frcc xsm:hidden">
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
                  <div className={poolStyle.filterSeacrhInputContainer}>
                    <input
                      type="number"
                      className={poolStyle.filterSearchInput}
                      value={feeValue}
                      onChange={inputChange}
                    />
                    <span className="text-gray-50 text-sm">%</span>
                  </div>
                </div>
              </div>
              <div
                className={`flex items-center justify-between flex-1 text-sm py-1 mt-2 lg:hidden`}
              >
                {feeList.map((item, index) => {
                  return (
                    <div
                      key={item.key + index}
                      className={`
                  ${isActive == item.key ? "text-white " : "text-gray-60"}
                   h-5 frcc cursor-pointer
                `}
                      onClick={() => {
                        setActive(item.key);
                        setFeeValue(item.key);
                      }}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border  frcc mr-1 ${
                          isActive == item.key
                            ? "border-green-10"
                            : "border-gray-60"
                        }`}
                      >
                        {isActive == item.key && (
                          <div className="w-3 h-3 rounded-full bg-green-10"></div>
                        )}
                      </div>
                      {item.value}%
                    </div>
                  );
                })}
                <div className={poolStyle.filterSeacrhInputContainer}>
                  <input
                    type="number"
                    className={poolStyle.filterSearchInput}
                    value={feeValue}
                    onChange={inputChange}
                  />
                  <span className="text-gray-50 text-sm">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-50 frcc">
                  Minimum received
                </div>
              </div>

              {updatedMapList[0]?.token_account_ids?.length <= 2 && (
                <div className="flex flex-wrap items-center justify-between">
                  {updatedMapList[0]?.token_account_ids?.map(
                    (ite: any, ind: number) => {
                      return (
                        <>
                          <div
                            key={ite.tokenId}
                            className="flex lg:h-13 xsm:h-12 mt-2 p-2 lg:w-45 xsm:w-5/12 shrink-0 items-center rounded bg-gray-230"
                          >
                            <Icon icon={ite.icon} className="h-7 w-7 mr-2" />
                            <span className="text-gray-50 text-base xsm:hidden">
                              {ite.symbol}
                            </span>
                            <span className="text-base text-white ml-2 xsm:hidden">
                              {calcTokenReceived(receiveAmounts[ind], ite)}
                            </span>

                            <div className="lg:hidden flex flex-col justify-center">
                              <span className="text-sm text-white">
                                {calcTokenReceived(receiveAmounts[ind], ite)}
                              </span>
                              <span className="text-gray-50 text-sm">
                                {ite.symbol}
                              </span>
                            </div>
                          </div>
                          <span className="text-gray-50 text-lg">
                            {ind <
                            updatedMapList[0]?.token_account_ids.length - 1
                              ? "+"
                              : ""}
                          </span>
                        </>
                      );
                    }
                  )}
                </div>
              )}

              {updatedMapList[0]?.token_account_ids?.length > 2 && (
                <div className="flex items-center justify-between bg-gray-230 rounded mt-4">
                  {updatedMapList[0]?.token_account_ids?.map(
                    (ite: any, ind: number) => {
                      return (
                        <>
                          <div
                            key={ite.tokenId}
                            className="flex lg:h-13 xsm:h-12 mt-2 p-1 shrink-0 items-center rounded "
                          >
                            <Icon icon={ite.icon} className="h-6 w-6 mr-1" />
                            <div className="flex flex-col">
                              <span className="text-gray-50 text-sm xsm:hidden">
                                {ite.symbol}
                              </span>
                              <span className="text-sm text-white xsm:hidden">
                                {calcTokenReceived(receiveAmounts[ind], ite)}
                              </span>
                            </div>

                            <div className="lg:hidden flex flex-col justify-center">
                              <span className="text-sm text-white">
                                {calcTokenReceived(receiveAmounts[ind], ite)}
                              </span>
                              <span className="text-gray-50 text-sm">
                                {ite.symbol}
                              </span>
                            </div>
                          </div>
                          <span className="text-gray-50 text-lg">
                            {ind <
                            updatedMapList[0]?.token_account_ids.length - 1
                              ? "+"
                              : ""}
                          </span>
                        </>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          )}

          {removeTabActive == "token" && (
            <>
              {/*  */}
              {updatedMapList[0]?.token_account_ids?.map(
                (ite: any, ind: number) => {
                  return (
                    <div key={ite.tokenId}>
                      <div className="mb-6">
                        <div
                          className="flex h-16 w-full items-center border border-transparent hover:border-green-20 rounded"
                          style={{ background: "rgba(0,0,0,.2)" }}
                        >
                          <input
                            type="number"
                            className="h-16 p-3 lg:w-74 text-white"
                            style={{ fontSize: "26px" }}
                            value={inputValList[ind]}
                            onChange={(e) => changeVal(e, ind)}
                            placeholder="0"
                          />
                          <Icon icon={ite.icon} className="h-7 w-7 mr-2" />
                          <span className="text-white text-base">
                            {ite.symbol}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}

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
                <div className="frcc xsm:hidden">
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
                  <div className={poolStyle.filterSeacrhInputContainer}>
                    <input
                      type="number"
                      className={poolStyle.filterSearchInput}
                      value={feeValue}
                      onChange={inputChange}
                    />
                    <span className="text-gray-50 text-sm">%</span>
                  </div>
                </div>
              </div>
              <div
                className={`flex items-center justify-between flex-1 text-sm py-1 mt-2 lg:hidden`}
              >
                {feeList.map((item, index) => {
                  return (
                    <div
                      key={item.key + index}
                      className={`
                  ${isActive == item.key ? "text-white " : "text-gray-60"}
                   h-5 frcc cursor-pointer
                `}
                      onClick={() => {
                        setActive(item.key);
                        setFeeValue(item.key);
                      }}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border  frcc mr-1 ${
                          isActive == item.key
                            ? "border-green-10"
                            : "border-gray-60"
                        }`}
                      >
                        {isActive == item.key && (
                          <div className="w-3 h-3 rounded-full bg-green-10"></div>
                        )}
                      </div>
                      {item.value}%
                    </div>
                  );
                })}
                <div className={poolStyle.filterSeacrhInputContainer}>
                  <input
                    type="number"
                    className={poolStyle.filterSearchInput}
                    value={feeValue}
                    onChange={inputChange}
                  />
                  <span className="text-gray-50 text-sm">%</span>
                </div>
              </div>

              {/* Minimum shares */}
              <div className="flex items-center justify-between mt-5">
                <div className="text-sm text-gray-50 frcc">Shares</div>
                <div className="text-white text-sm">{calcSharesRemoved()}</div>
              </div>
              {/* tips  */}
              {error && (
                <div
                  className="text-yellow-10 text-sm border h-11 w-full rounded flex px-4 py-1 items-center my-6"
                  style={{
                    borderColor: "rgba(230, 180, 1, 0.3)",
                    backgroundColor: "rgba(230, 180, 1, 0.14)",
                  }}
                >
                  <span>{`Insufficient shares`}</span>
                </div>
              )}
            </>
          )}
          {/* submit */}
          {accountStore.isSignedIn ? (
            (removeTabActive == "share" ? canSubmit : canSubmitByToken) ? (
              <div
                className="poolBtnStyleBase h-11 mt-6 cursor-pointer hover:opacity-90"
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
              <div className="poolBtnStyleDefaultBase h-11 mt-6 cursor-not-allowed">
                Remove Liquidity
              </div>
            )
          ) : (
            <div
              className="poolBtnStyleDefaultBase h-11 mt-6 cursor-pointer hover:opacity-90"
              onClick={() => showWalletSelectorModal(appStore.setShowRiskModal)}
            >
              Connect Wallet
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
