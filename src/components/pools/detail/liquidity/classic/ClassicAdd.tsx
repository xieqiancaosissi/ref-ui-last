import React, { useEffect, useState, useMemo, useCallback } from "react";
import Modal from "react-modal";
import _ from "lodash";
import { AddLiqTitleIcon } from "../icon";
import { LpModalCloseIcon } from "@/components/pools/icon";
import { Icon } from "../IconCom";
import { ftGetBalance, ftGetTokenMetadata } from "@/services/token";
import { disPlayBalance } from "@/utils/uiNumber";
import { useAccountStore } from "@/stores/account";
import BigNumber from "bignumber.js";
import { RATED_POOL_LP_TOKEN_DECIMALS } from "@/utils/constant";
import {
  percentLess,
  scientificNotationToString,
  toReadableNumber,
  percent,
  toPrecision,
  toNonDivisibleNumber,
  calculateFairShare,
} from "@/utils/numbers";
import { ButtonTextWrapper } from "@/components/common/Button";
import { addLiquidityToPool } from "@/services/pool";
import AddLiqTip from "../../addLiqTip";
import { PoolDetailCard } from "./ClassicAddDetail";
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
  const { isOpen, onRequestClose, poolDetail, pureIdList, updatedMapList } =
    props;
  const [balancesList, setBalances] = useState<any>([]);
  const [inputValList, setInputValList] = useState<any>([]);
  const closeInit = () => {
    setInputValList([]);
  };
  const appStore = useAppStore();
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
    const fetchBalances = async () => {
      try {
        const promises = updatedMapList[0].token_account_ids.map((token: any) =>
          returnBalance(token)
        );
        const resolvedBalances = await Promise.all(promises);
        setBalances(resolvedBalances);
      } catch (err) {
        console.log(err);
      }
    };
    fetchBalances();
  }, [updatedMapList[0]?.token_account_ids]);
  const [preShare, setPreShare] = useState("0");
  const dealTokenAmounts = (
    ind: number,
    anotherInd: number,
    currentList: any
  ) => {
    if (!updatedMapList[0].token_account_ids) return;
    const fairShares = calculateFairShare({
      shareOf: updatedMapList[0]?.shares_total_supply,
      contribution: toNonDivisibleNumber(
        updatedMapList[0]?.token_account_ids[ind]?.decimals,
        currentList[ind]
      ),
      totalContribution:
        updatedMapList[0].supplies[updatedMapList[0].token_account_ids[ind].id],
    });
    let secondAmount = "";
    if (currentList[ind]) {
      secondAmount = toReadableNumber(
        updatedMapList[0]?.token_account_ids[anotherInd]?.decimals,
        calculateFairShare({
          shareOf:
            updatedMapList[0]?.supplies[
              updatedMapList[0]?.token_account_ids[anotherInd].id
            ],
          contribution: fairShares,
          totalContribution: updatedMapList[0]?.shares_total_supply,
        })
      );
    }
    const newValues = [...currentList];
    newValues[anotherInd] = secondAmount;
    // console.log(newValues);

    // console.log(inputValList);
    // setPreShare(toReadableNumber(24, fairShares));
    // debouncedSendSearchValue(null);
    return {
      dealVal: newValues,
      fairShares,
    };
  };

  const changeVal = useCallback((e: any, ind: number) => {
    setInputValList((prev: string[]) => {
      const newValues = [...prev];
      newValues[ind] = e.target.value;
      const { dealVal, fairShares }: any = dealTokenAmounts(
        ind,
        ind === 0 ? 1 : 0,
        newValues
      ); // use update newValues
      setPreShare(toReadableNumber(24, fairShares));
      return dealVal;
    });
  }, []);

  //

  const shareDisplay = () => {
    let result = "";
    let percentShare = "";
    let displayPercentShare = "";
    if (preShare && new BigNumber("0").isLessThan(preShare)) {
      const myShareBig = new BigNumber(preShare);
      if (myShareBig.isLessThan("0.001")) {
        result = "<0.001";
      } else {
        result = `${myShareBig.toFixed(3)}`;
      }
    } else {
      result = "-";
    }

    if (result !== "-") {
      percentShare = `${percent(
        preShare,
        scientificNotationToString(
          new BigNumber(
            toReadableNumber(24, updatedMapList[0]?.shares_total_supply)
          )
            .plus(new BigNumber(preShare))
            .toString()
        )
      )}`;

      if (Number(percentShare) > 0 && Number(percentShare) < 0.01) {
        displayPercentShare = "< 0.01%";
      } else {
        displayPercentShare = `${toPrecision(percentShare, 2)}%`;
      }
    }

    return {
      lpTokens: result,
      shareDisplay: displayPercentShare,
    };
  };

  const [canSubmit, setCanSubmit] = useState(true);
  const [inputAmountIsEmpty, setInputAmountIsEmpty] = useState(true);
  const [notEnoughList, setNotEnoughList] = useState([]);
  useEffect(() => {
    let flag: boolean = true;
    let emptyFlag: boolean = false;
    const k: any = [];
    inputValList.map((item: any, index: number) => {
      if (+item > balancesList[index]?.balance) {
        flag = false;
        k.push(balancesList[index]?.symbol);
      }
      if (item > 0) {
        emptyFlag = true;
      }
    });
    setInputAmountIsEmpty(emptyFlag);
    setCanSubmit(flag);
    setNotEnoughList(k);
  }, [inputValList]);

  useEffect(() => {
    let emptyFlag: boolean = true;
    inputValList.map((item: any, index: number) => {
      if (!+item) {
        emptyFlag = false;
      }
    });
    setInputAmountIsEmpty(emptyFlag);
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  function submit() {
    return addLiquidityToPool({
      id: poolDetail.id,
      tokenAmounts: [
        {
          token: updatedMapList[0]?.token_account_ids[0],
          amount: inputValList[0],
        },
        {
          token: updatedMapList[0]?.token_account_ids[1],
          amount: inputValList[1],
        },
      ],
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {
        closeInit();
        onRequestClose();
      }}
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
          <AddLiqTitleIcon />
          <LpModalCloseIcon
            className="cursor-pointer hover:opacity-90"
            onClick={() => {
              closeInit();
              onRequestClose();
            }}
          />
        </div>
        <div className="flex flex-col justify-between w-108 min-h-123 rounded-lg bg-dark-10 px-4 py-5">
          {updatedMapList[0]?.token_account_ids?.map(
            (ite: any, ind: number) => {
              return (
                <div key={ite.tokenId}>
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-gray-50 mb-2 text-sm">
                      <span>
                        Balance:{" "}
                        <span
                          className={`underline hover:cursor-pointer hover:text-white  ${
                            inputValList[ind] == balancesList[ind]?.balance
                              ? ""
                              : "text-gray-50"
                          }`}
                          onClick={() => {
                            changeVal(
                              {
                                target: {
                                  value: balancesList[ind]?.balance,
                                },
                              },
                              ind
                            );
                          }}
                        >
                          {disPlayBalance(
                            accountStore.isSignedIn,
                            balancesList[ind]?.balance
                          )}
                        </span>
                      </span>
                    </div>
                    <div
                      className="flex h-16 w-full items-center border border-transparent hover:border-green-20 rounded"
                      style={{ background: "rgba(0,0,0,.2)" }}
                    >
                      <input
                        type="number"
                        className="h-16 p-3 w-74 text-white"
                        style={{ fontSize: "26px" }}
                        value={inputValList[ind]}
                        onChange={(e) => changeVal(e, ind)}
                        placeholder="0"
                      />
                      <Icon icon={ite.icon} className="h-7 w-7 mr-2" />
                      <span className="text-white text-base">{ite.symbol}</span>
                    </div>
                  </div>
                </div>
              );
            }
          )}

          {/* slippage */}
          <div className="flex items-center justify-between mt-5 ">
            <div className="text-sm text-gray-50 frcc">LP tokens</div>
            <div className="text-white text-sm">
              {shareDisplay().lpTokens || "-"}
            </div>
          </div>

          {/* Minimum shares */}
          <div className="flex items-center justify-between my-5">
            <div className="text-sm text-gray-50 frcc">Share</div>
            <div className="text-white text-sm">
              {shareDisplay().shareDisplay || "-"}
            </div>
          </div>
          {/* tips  */}
          {!canSubmit && (
            <div
              className="text-yellow-10 text-sm border h-11 w-full rounded flex px-2 py-1 items-center mt-2"
              style={{
                borderColor: "rgba(230, 180, 1, 0.3)",
                backgroundColor: "rgba(230, 180, 1, 0.14)",
              }}
            >
              <span>{`You don't have enough ${notEnoughList.join("｜")}`}</span>
            </div>
          )}

          <AddLiqTip tips="Fees automatically contribute to your liquidity for market making."></AddLiqTip>

          {/* submit */}
          {accountStore.isSignedIn ? (
            canSubmit && inputAmountIsEmpty ? (
              <div
                className="poolBtnStyleBase h-11 cursor-pointer hover:opacity-90"
                onClick={() => {
                  setIsLoading(true);
                  submit();
                }}
              >
                <ButtonTextWrapper
                  loading={isLoading}
                  Text={() => <span>Add Liquidity</span>}
                />
              </div>
            ) : (
              <div className="poolBtnStyleDefaultBase h-11  cursor-not-allowed">
                Add Liquidity
              </div>
            )
          ) : (
            <div
              className="poolBtnStyleDefaultBase h-11 cursor-pointer hover:opacity-90"
              onClick={() => showWalletSelectorModal(appStore.setShowRiskModal)}
            >
              Connect Wallet
            </div>
          )}
        </div>

        {/*  */}
        {/* {poolDetail && (
          <PoolDetailCard
            tokens_o={updatedMapList[0].token_account_ids}
            pool={updatedMapList[0]}
            poolDetail={poolDetail}
          />
        )} */}
      </div>
    </Modal>
  );
}
