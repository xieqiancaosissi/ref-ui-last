import React, { useState, useMemo, Fragment, useRef } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import _ from "lodash";
import BigNumber from "bignumber.js";
import {
  UserOrderInfo,
  V3_POOL_SPLITER,
  pointToPrice,
} from "@/services/swapV3";
import { MyOrderMobileArrow, MyOrderInstantSwapArrowRight } from "../../icons2";
import {
  calculateFeePercent,
  toPrecision,
  toReadableNumber,
  scientificNotationToString,
  checkAllocations,
} from "@/utils/numbers";
import { TokenMetadata } from "@/services/ft-contract";
import Big from "big.js";
import { TOKEN_LIST_FOR_RATE } from "@/services/commonV3";
import { HiOutlineExternalLink } from "@/components/reactIcons";
import getConfig from "@/utils/config";
import { getTxId } from "@/services/indexer";
import { MobileInfoBanner } from "../widget";
import {
  NearblocksIcon,
  PikespeakIcon,
  TxLeftArrow,
} from "@/components/pools/icon";
import { SellTokenAmount, BuyTokenAmount } from "./tokenAmountUI";
import UnClaimTip from "./unclaimTip";
import ClaimButton from "./claimButton";
import Unclaim from "./unclaim";
import Created from "./created";
import Actions from "./actions";
import SwapBanner from "./swapBanner";
export default function ActiveLine({
  tokensMap,
  order,
  index,
  sellAmountToBuyAmount,
  orderTx,
  hoverOn,
  setHoverOn,
}: {
  order: UserOrderInfo;
  index: number;
  sellAmountToBuyAmount: any;
  tokensMap: { [key: string]: TokenMetadata };
  orderTx: string;
  hoverOn: number;
  setHoverOn: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [loadingStates, setLoadingStates] = useState<Record<string, any>>({});
  const [hoveredTx, setHoveredTx] = useState<string | null>(null);
  const closeTimeoutRef = useRef(null) as any;
  const buyToken = tokensMap[order.buy_token];
  const sellToken = tokensMap[order.sell_token];
  const calPoint =
    sellToken.id === order.pool_id.split(V3_POOL_SPLITER)[0]
      ? order.point
      : -order.point;

  const price = pointToPrice({
    tokenA: sellToken,
    tokenB: buyToken,
    point: calPoint,
  });
  const sort =
    TOKEN_LIST_FOR_RATE.indexOf(sellToken?.symbol) > -1 && +price !== 0;

  const orderRate = useMemo(() => {
    let p = price;
    if (sort) {
      p = new BigNumber(1).dividedBy(price).toFixed();
    }
    return (
      <span className="whitespace-nowrap  col-span-1 flex items-start xs:flex-row xs:items-center flex-col relative  xs:right-0">
        <span className="mr-1 text-white text-sm" title={p}>
          {toPrecision(p, 2)}
        </span>
        <span className="text-gray-10 text-xs xs:hidden">
          {`${sort ? sellToken?.symbol : buyToken.symbol}/${
            sort ? buyToken.symbol : sellToken.symbol
          }`}
        </span>
        <span className="text-white text-sm lg:hidden md:hidden">
          {`${sort ? sellToken.symbol : buyToken.symbol}`}
        </span>
      </span>
    );
  }, [buyToken, sellToken, price, sort]);

  if (!buyToken || !sellToken) return null;
  const handleMouseEnter = (receipt_id: string) => {
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

  async function handleTxClick(receipt_id: string, url: string) {
    setLoadingStates((prevStates) => ({ ...prevStates, [receipt_id]: true }));
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
      setLoadingStates((prevStates) => ({
        ...prevStates,
        [receipt_id]: false,
      }));
    }
  }
  const swapIn = toReadableNumber(
    sellToken.decimals,
    scientificNotationToString(
      new Big(order.original_deposit_amount || "0")
        .minus(order.original_amount || "0")
        .toString()
    )
  );

  const swapOut = toReadableNumber(
    buyToken.decimals,
    order.swap_earn_amount || "0"
  );

  const orderIn = toReadableNumber(
    sellToken.decimals,
    order.original_amount || "0"
  );

  const totalIn = toReadableNumber(
    sellToken.decimals,
    order.original_deposit_amount || "0"
  );

  const unClaimedAmount = toReadableNumber(
    buyToken.decimals,
    order.unclaimed_amount || "0"
  );

  const claimedAmount = toReadableNumber(
    buyToken.decimals,
    scientificNotationToString(
      new Big(order.bought_amount || "0")
        .minus(order.unclaimed_amount || "0")
        .toString()
    )
  );

  const buyAmountToSellAmount = (
    undecimaled_amount: string,
    order: UserOrderInfo,
    price: string
  ) => {
    const sell_amount = new Big(
      toReadableNumber(
        tokensMap[order.buy_token].decimals,
        undecimaled_amount || "0"
      )
    )
      .div(price)
      .toString();
    return scientificNotationToString(sell_amount);
  };

  const unClaimedAmountIn = buyAmountToSellAmount(
    order.unclaimed_amount || "0",
    order,
    price
  );

  const claimedAmountIn = buyAmountToSellAmount(
    scientificNotationToString(
      new Big(order.bought_amount || "0")
        .minus(order.unclaimed_amount || "0")
        .toString()
    ),
    order,
    price
  );

  const buyAmountRaw = sellAmountToBuyAmount(
    order.original_amount,
    order,
    price
  );

  const buyAmount = new Big(buyAmountRaw).gt(
    toReadableNumber(buyToken.decimals, order.bought_amount || "0")
  )
    ? buyAmountRaw
    : toReadableNumber(buyToken.decimals, order.bought_amount || "0");

  const totalOut = scientificNotationToString(
    new Big(buyAmount).plus(swapOut).toString()
  );

  const pendingAmount = scientificNotationToString(
    new Big(toPrecision(buyAmount || "0", 5, false, false) || 0)
      .minus(
        toPrecision(
          toReadableNumber(buyToken.decimals, order.bought_amount || "0") ||
            "0",
          5,
          false,
          false
        )
      )
      .toString()
  );

  const pUnClaimedAmount = new Big(unClaimedAmount)
    .div(buyAmount)
    .times(100)
    .toNumber();

  const pClaimedAmount = new Big(claimedAmount)
    .div(buyAmount)
    .times(100)
    .toNumber();

  const pPendingAmount = new Big(pendingAmount)
    .div(buyAmount)
    .times(100)
    .toNumber();

  const displayPercents = checkAllocations("100", [
    pClaimedAmount > 0 && pClaimedAmount < 5
      ? "5"
      : scientificNotationToString(pClaimedAmount.toString()),
    pUnClaimedAmount > 0 && pUnClaimedAmount < 5
      ? "5"
      : scientificNotationToString(pUnClaimedAmount.toString()),

    pPendingAmount > 0 && pPendingAmount < 5
      ? "5"
      : scientificNotationToString(pPendingAmount.toString()),
  ]);

  const fee = Number(order.pool_id.split(V3_POOL_SPLITER)[2]);

  const feeTier = (
    <span className="rounded relative xsm:right-0 xsm:bg-none right-3 text-left  text-gray-10 px-1 py-0.5 h-5 text-xs lg:bg-gray-60 lg:bg-opacity-15 xs:text-white">
      {`${toPrecision(calculateFeePercent(fee / 100).toString(), 2)}% `}
    </span>
  );
  return (
    <Fragment>
      <tr>
        <td colSpan={9}>
          <div className="pb-2.5"></div>
        </td>
      </tr>
      <tr
        className={`mb-4 overflow-visible   xs:hidden px-4 py-3 text-sm   z-20   relative  w-full  items-center   ${
          hoverOn === index
            ? "bg-gray-20 bg-opacity-50 rounded-t-lg"
            : "bg-gray-20 bg-opacity-20 rounded-lg"
        }`}
        onMouseEnter={() => {
          setHoverOn(index);
        }}
        style={{
          zIndex: 21,
        }}
      >
        <td className={hoverOn === index ? " rounded-tl-xl" : " rounded-l-xl"}>
          <SellTokenAmount sellToken={sellToken} orderIn={orderIn} />
        </td>

        <td>
          <span className="text-white text-lg frcs w-7 xs:hidden ">
            <MyOrderInstantSwapArrowRight />
          </span>
        </td>

        <td>
          <BuyTokenAmount buyToken={buyToken} buyAmount={buyAmount} />
        </td>

        <td>{feeTier}</td>

        <td>
          <div className="w-14"></div>
        </td>

        <td>{orderRate}</td>

        <td>
          <Created order={order} />
        </td>

        <td className={hoverOn === index ? " rounded-tr-xl" : " rounded-r-xl"}>
          <Unclaim
            buyToken={buyToken}
            order={order}
            claimedAmount={claimedAmount}
            unClaimedAmount={unClaimedAmount}
            displayPercents={displayPercents}
            pendingAmount={pendingAmount}
          />
        </td>
      </tr>

      {hoverOn === index && (
        <>
          <tr className="xs:flex z-20 relative  xs:flex-col whitespace-nowrap xs:bg-cardBg xs:bg-opacity-50  bottom-2 xs:bottom-0 w-full text-sm text-gray-10 bg-cardBg rounded-xl px-5 pb-5 pt-10 xs:px-3 xs:py-4 xs:text-xs">
            <SwapBanner
              order={order}
              totalIn={totalIn}
              totalOut={totalOut}
              swapIn={swapIn}
              swapOut={swapOut}
              sellToken={sellToken}
              buyToken={buyToken}
              sort={sort}
              claimedAmountIn={claimedAmountIn}
              claimedAmount={claimedAmount}
              unClaimedAmountIn={unClaimedAmountIn}
              unClaimedAmount={unClaimedAmount}
            />
          </tr>

          <tr className="relative bottom-6 rounded-b-xl bg-gray-20 bg-opacity-50">
            <td colSpan={8} className="rounded-b-xl">
              <div className="frcb pb-3 py-6 px-4 text-xs">
                <div className="frcs relative">
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
                                handleTxClick(
                                  orderTx,
                                  `${getConfig().explorerUrl}/txns`
                                )
                              }
                            >
                              <NearblocksIcon />
                              <p className="ml-2 text-sm">nearblocks</p>
                              <div
                                className="ml-3 arrow"
                                style={{ display: "none" }}
                              >
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
                                  `${
                                    getConfig().pikespeakUrl
                                  }/transaction-viewer`
                                )
                              }
                            >
                              <PikespeakIcon />
                              <p className="ml-2 text-sm">Pikespeak...</p>
                              <div
                                className="ml-3 arrow"
                                style={{ display: "none" }}
                              >
                                <TxLeftArrow />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </a>
                  )}
                </div>

                <div className="frcs">
                  <ClaimButton
                    unClaimedAmount={unClaimedAmount}
                    order={order}
                  />

                  <Actions order={order} />
                </div>
              </div>
            </td>
          </tr>
        </>
      )}

      <div
        className="w-full mb-4 md:hidden lg:hidden"
        style={{
          zIndex: 20 - index,
        }}
      >
        {/* title */}
        <div className="rounded-t-xl relative bg-orderMobileTop px-3 pt-3">
          <div className="flex items-center relative justify-between">
            <SellTokenAmount sellToken={sellToken} orderIn={orderIn} />
            <MyOrderMobileArrow />
            <BuyTokenAmount buyToken={buyToken} buyAmount={buyAmount} />
          </div>

          <Created order={order} />

          <div className="absolute right-4 bottom-2.5 z-50  text-xs">
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
                  <div className="w-44 absolute top-5 right-0 bg-poolDetaileTxBgColor border border-poolDetaileTxBorderColor rounded-lg p-2 shadow-lg z-50">
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
                          handleTxClick(
                            orderTx,
                            `${getConfig().explorerUrl}/txns`
                          )
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
        {/*  content */}
        <div className="rounded-b-xl p-3 bg-cardBg">
          <MobileInfoBanner
            text={
              <FormattedMessage id="fee_tiers" defaultMessage={"Fee Tiers"} />
            }
            value={feeTier}
          />

          <MobileInfoBanner
            text={`1 ${
              sort ? buyToken.symbol : tokensMap[order.sell_token].symbol
            } Price`}
            value={orderRate}
          />

          <MobileInfoBanner
            text={
              <FormattedMessage defaultMessage={"Executed"} id="executed" />
            }
            value={
              <Unclaim
                buyToken={buyToken}
                order={order}
                claimedAmount={claimedAmount}
                unClaimedAmount={unClaimedAmount}
                displayPercents={displayPercents}
                pendingAmount={pendingAmount}
              />
            }
          />

          <UnClaimTip
            claimedAmount={claimedAmount}
            unClaimedAmount={unClaimedAmount}
            pendingAmount={pendingAmount}
            order={order}
            displayPercents={displayPercents}
          />

          <div className="flex items-center w-full xs:mt-2">
            {<Actions order={order} />}
            <ClaimButton unClaimedAmount={unClaimedAmount} order={order} />
          </div>
        </div>

        {/* swap banner */}
        {new Big(order.original_deposit_amount || "0")
          .minus(order.original_amount || "0")
          .gt(0) ? (
          <SwapBanner
            order={order}
            totalIn={totalIn}
            totalOut={totalOut}
            swapIn={swapIn}
            swapOut={swapOut}
            sellToken={sellToken}
            buyToken={buyToken}
            sort={sort}
            claimedAmountIn={claimedAmountIn}
            claimedAmount={claimedAmount}
            unClaimedAmountIn={unClaimedAmountIn}
            unClaimedAmount={unClaimedAmount}
          />
        ) : null}
      </div>
    </Fragment>
  );
}
