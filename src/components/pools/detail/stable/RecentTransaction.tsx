import React, { useEffect, useState, useRef } from "react";
import { useClassicPoolTransaction } from "@/hooks/usePools";
import {
  toReadableNumber,
  numberWithCommas,
  toPrecision,
} from "@/utils/numbers";
import { formatNumber } from "@/utils/uiNumber";
import { toRealSymbol } from "@/services/farm";
import getConfig from "@/utils/config";
import { getTxId } from "@/services/indexer";
import {
  PikespeakIcon,
  NearblocksIcon,
  TxLeftArrow,
  BlinkIcon,
} from "../../icon";
import styles from "./style.module.css";
import Big from "big.js";

export default function RecentTransaction(props: any) {
  const { activeTab, poolId, updatedMapList } = props;
  const [title, setTitle] = useState<any>([]);
  const { swapTransaction, liquidityTransactions } = useClassicPoolTransaction({
    pool_id: poolId,
  });
  const [containerWidth, setContainerWidth] = useState([
    "col-span-2",
    "col-span-4",
    "col-span-3",
  ]);
  const [loadingStates, setLoadingStates] = useState<any>({});
  const [hoveredTx, setHoveredTx] = useState(null);
  const closeTimeoutRef = useRef<any>(null);
  const handleMouseEnter = (receipt_id: any) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setHoveredTx(receipt_id);
  };
  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredTx(null);
    }, 200);
  };
  async function handleTxClick(receipt_id: any, url: string) {
    setLoadingStates((prevStates: any) => ({
      ...prevStates,
      [receipt_id]: true,
    }));
    try {
      const data = await getTxId(receipt_id);
      if (data && data.receipts && data.receipts.length > 0) {
        const txHash = data.receipts[0].originated_from_transaction_hash;
        window.open(`${url}/${txHash}`, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error(
        "An error occurred while fetching transaction data:",
        error
      );
    } finally {
      setLoadingStates((prevStates: any) => ({
        ...prevStates,
        [receipt_id]: false,
      }));
    }
  }

  useEffect(() => {
    let titleList;
    switch (activeTab) {
      case "swap":
        titleList = [
          {
            key: "From",
            colSpan: "col-span-3",
          },
          {
            key: "To",
            colSpan: "col-span-3",
          },
          {
            key: "Time",
            colSpan: "col-span-3",
          },
        ];
        break;
      case "liquidity":
        // let container = ["col-span-2", "col-span-4", "col-span-3"];
        // if (updatedMapList[0].token_account_ids.length == 3) {
        //   container = ["col-span-1", "col-span-5", "col-span-3"];
        //   setContainerWidth(["col-span-1", "col-span-5", "col-span-3"]);
        // }
        // if (updatedMapList[0].token_account_ids.length == 4) {
        //   container = ["col-span-1", "col-span-5", "col-span-3"];
        //   setContainerWidth(["col-span-1", "col-span-5", "col-span-3"]);
        // }

        titleList = [
          {
            key: "Action",
            colSpan: containerWidth[0],
          },
          {
            key: "Amount",
            colSpan: containerWidth[1],
          },
          {
            key: "Time",
            colSpan: containerWidth[2],
          },
        ];
        break;
      default:
        break;
    }

    setTitle(titleList);
  }, [activeTab]);

  // swap
  const renderSwapTransactions = swapTransaction.map((tx, index) => {
    const swapIn = updatedMapList[0].token_account_ids.find(
      (t: any) => t.id === tx.token_in
    );

    const swapOut = updatedMapList[0].token_account_ids.find(
      (t: any) => t.id === tx.token_out
    );

    if (!swapIn || !swapOut) return null;

    const swapInAmount = toReadableNumber(swapIn.decimals, tx.swap_in);
    const displayInAmount =
      Number(swapInAmount) < 0.01
        ? "<0.01"
        : numberWithCommas(toPrecision(swapInAmount, 6));

    const swapOutAmount = toReadableNumber(swapOut.decimals, tx.swap_out);

    const displayOutAmount =
      Number(swapOutAmount) < 0.01
        ? "<0.01"
        : numberWithCommas(toPrecision(swapOutAmount, 6));

    return (
      <div
        key={tx.receipt_id + index}
        className={`text-sm grid grid-cols-9 hover:bg-poolRecentHover my-3`}
      >
        <div className="col-span-3">
          <span className="col-span-1 text-white mr-1" title={swapInAmount}>
            {displayInAmount}
          </span>

          <span className="text-gray-60">{toRealSymbol(swapIn.symbol)}</span>
        </div>

        <div className="col-span-3">
          <span className="text-white" title={swapOutAmount}>
            {displayOutAmount}
          </span>

          <span className="ml-1 text-gray-60">
            {toRealSymbol(swapOut.symbol)}
          </span>
        </div>

        <div className="col-span-3 relative ">
          <span
            key={tx.receipt_id}
            className="inline-flex items-center cursor-pointer"
            onMouseEnter={() => handleMouseEnter(tx.receipt_id)}
            onMouseLeave={handleMouseLeave}
          >
            {loadingStates[tx.receipt_id] ? (
              <div className="hover:underline cursor-pointer text-gray-60 min-w-36">
                {tx.timestamp}
                <span className={styles.loadingDots}></span>
              </div>
            ) : (
              <>
                <span className="hover:underline cursor-pointer text-gray-60 min-w-36">
                  {tx.timestamp}
                </span>
                <BlinkIcon className="opacity-40 hover:opacity-100 ml-2"></BlinkIcon>
              </>
            )}
            {hoveredTx === tx.receipt_id && (
              <div className="bg-dark-70 w-41 h-25 absolute top-6 -right-2 bg-poolDetaileTxBgColor  p-2 shadow-lg rounded z-50">
                <div className="flex flex-col">
                  <div
                    className="mb-2 px-3 py-2 hover:bg-dark-10 text-white rounded-md flex items-center"
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
                        tx.receipt_id,
                        `${getConfig().explorerUrl}/txns`
                      )
                    }
                  >
                    <NearblocksIcon />
                    <p className="ml-2">nearblocks</p>
                    <div className="ml-3 arrow" style={{ display: "none" }}>
                      <TxLeftArrow />
                    </div>
                  </div>
                  <div
                    className="px-3 py-2 hover:bg-dark-10 text-white rounded-md flex items-center"
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
                        tx.receipt_id,
                        `${getConfig().pikespeakUrl}/transaction-viewer`
                      )
                    }
                  >
                    <PikespeakIcon />
                    <p className="ml-2">Pikespeak...</p>
                    <div className="ml-3 arrow" style={{ display: "none" }}>
                      <TxLeftArrow />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </span>
        </div>
      </div>
    );
  });

  const renderLiquidityTransactions = liquidityTransactions.map((tx, index) => {
    const { amounts } = tx;
    const renderTokens: any[] = [];
    const amountsObj: any[] = JSON.parse(amounts.replace(/\'/g, '"'));
    amountsObj.forEach((amount: string, index) => {
      if (Big(amount || 0).gt(0)) {
        renderTokens.push({
          token: updatedMapList[0].token_account_ids[index],
          amount: toReadableNumber(
            updatedMapList[0].token_account_ids[index].decimals,
            amountsObj[index]
          ),
        });
      }
    });

    return (
      <div
        key={tx.receipt_id + index}
        className={`text-sm grid grid-cols-9 hover:bg-poolRecentHover my-3`}
      >
        <div className={containerWidth[0]}>
          <span className="text-white">
            {tx.method_name.toLowerCase().indexOf("add") > -1 && "Add"}

            {tx.method_name.toLowerCase().indexOf("remove") > -1 && "Remove"}
          </span>
        </div>

        <div className={`${containerWidth[1]} break-words`}>
          {renderTokens.map((renderToken, index) => {
            return (
              <>
                <span className="text-white" title={renderToken.amount}>
                  {formatNumber(renderToken.amount)}
                </span>

                <span className="ml-1 text-gray-60">
                  {toRealSymbol(renderToken.token.symbol)}
                </span>
                {index !== renderTokens.length - 1 ? (
                  <span className="mx-1 text-white">+</span>
                ) : null}
              </>
            );
          })}
        </div>

        <div className={`${containerWidth[2]} relative `}>
          <span
            key={tx.receipt_id}
            className="inline-flex items-center cursor-pointer"
            onMouseEnter={() => handleMouseEnter(tx.receipt_id)}
            onMouseLeave={handleMouseLeave}
          >
            {loadingStates[tx.receipt_id] ? (
              <div className="hover:underline cursor-pointer text-gray-60 min-w-36">
                {tx.timestamp}
                <span className={styles.loadingDots}></span>
              </div>
            ) : (
              <>
                <span className="hover:underline cursor-pointer text-gray-60 min-w-36">
                  {tx.timestamp}
                </span>
                <BlinkIcon className="opacity-40 hover:opacity-100 ml-0.5"></BlinkIcon>
              </>
            )}
            {hoveredTx === tx.receipt_id && (
              <div className="bg-dark-70 w-41 h-25 absolute top-6 -right-2 bg-poolDetaileTxBgColor  p-2 shadow-lg rounded z-50">
                <div className="flex flex-col">
                  <div
                    className="mb-2 px-3 py-2 hover:bg-dark-10 text-white rounded-md flex items-center"
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
                        tx.receipt_id,
                        `${getConfig().explorerUrl}/txns`
                      )
                    }
                  >
                    <NearblocksIcon />
                    <p className="ml-2">nearblocks</p>
                    <div className="ml-3 arrow" style={{ display: "none" }}>
                      <TxLeftArrow />
                    </div>
                  </div>
                  <div
                    className="px-3 py-2 hover:bg-dark-10 text-white rounded-md flex items-center"
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
                        tx.receipt_id,
                        `${getConfig().pikespeakUrl}/transaction-viewer`
                      )
                    }
                  >
                    <PikespeakIcon />
                    <p className="ml-2">Pikespeak...</p>
                    <div className="ml-3 arrow" style={{ display: "none" }}>
                      <TxLeftArrow />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </span>
        </div>
      </div>
    );
  });

  // liquidity

  return (
    <div
      className="w-183 max-h-106 rounded-md p-4 overflow-auto"
      style={{
        background: "rgba(33, 43, 53, 0.2)",
      }}
    >
      <div className={`grid grid-cols-9 select-none`}>
        {title.map((item: any, index: number) => {
          return (
            <span
              key={item + "_" + index}
              className={`${item.colSpan} text-gray-60 text-sm`}
            >
              {item.key}
            </span>
          );
        })}
      </div>
      {activeTab == "swap"
        ? renderSwapTransactions
        : renderLiquidityTransactions}
    </div>
  );
}
