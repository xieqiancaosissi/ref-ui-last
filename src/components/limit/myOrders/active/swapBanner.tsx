import { FormattedMessage } from "react-intl";
import Big from "big.js";
import { UserOrderInfo } from "@/services/swapV3";
import {
  toPrecision,
  ONLY_ZEROS,
  scientificNotationToString,
} from "@/utils/numbers";
import ExclamationTip from "../exclamationTip";
import { TokenMetadata } from "@/services/ft-contract";
import { isClientMobie } from "@/utils/device";
import { MyOrderInstantSwapArrowRight, FilledEllipse } from "../../icons2";
import { BsCheckCircle } from "@/components/reactIcons";
import { useSwapStore } from "@/stores/swap";
import { isMobile } from "@/utils/device";
export default function SwapBanner({
  order,
  totalIn,
  totalOut,
  swapIn,
  swapOut,
  sellToken,
  buyToken,
  sort,
  claimedAmountIn,
  claimedAmount,
  unClaimedAmountIn,
  unClaimedAmount,
}: {
  order: UserOrderInfo;
  totalIn: string;
  totalOut: string;
  swapIn: string;
  swapOut: string;
  sellToken: TokenMetadata;
  buyToken: TokenMetadata;
  sort: boolean;
  claimedAmountIn: string;
  claimedAmount: string;
  unClaimedAmountIn: string;
  unClaimedAmount: string;
}) {
  const swapStore = useSwapStore();
  const allTokenPrices = swapStore.getAllTokenPrices();
  const sellTokenPrice = allTokenPrices?.[sellToken.id]?.price || null;
  const buyTokenPrice = allTokenPrices?.[buyToken.id]?.price || null;
  function instant_swap_tip() {
    const token_sell_symbol = sellToken.symbol;
    const token_buy_symbol = buyToken.symbol;
    const sell_token_price = sellTokenPrice
      ? `($${toPrecision(sellTokenPrice, 2)})`
      : "";
    const buy_token_price = buyTokenPrice
      ? `($${toPrecision(buyTokenPrice, 2)})`
      : "";
    let rate = new Big(swapOut).div(ONLY_ZEROS.test(swapIn) ? 1 : swapIn);
    if (sort) {
      rate = new Big(1).div(rate.eq(0) ? "1" : rate);
    }
    const display_rate = rate.toFixed(3);
    let result = "";
    if (sort) {
      result = `1 ${token_buy_symbol} ${buy_token_price} = ${display_rate} ${token_sell_symbol}`;
    } else {
      result = `1 ${token_sell_symbol} ${sell_token_price} = ${display_rate} ${token_buy_symbol}`;
    }
    return result;
  }
  return (
    <td
      colSpan={8}
      className="xsm:block xsm:rounded-xl xs:text-xs text-gray-10 w-full relative lg:bottom-1.5 lg:pt-6 xsm:pt-4 bg-gray-20 bg-opacity-20"
    >
      {new Big(order.original_deposit_amount || "0")
        .minus(order.original_amount || "0")
        .gt(0) && (
        <>
          <div className="flex items-center px-4 pb-4  justify-between ">
            <span className="flex items-center">
              <FormattedMessage
                id="initial_order"
                defaultMessage={"Initial Order"}
              />
              {!isMobile() && (
                <ExclamationTip
                  id="this_order_has_been_partially_filled"
                  defaultMessage="This order has been partially filled "
                  dataPlace="bottom"
                  colorhex="#7E8A93"
                  uniquenessId={
                    "this_order_has_been_partially_filled" + order.order_id
                  }
                />
              )}
            </span>

            <span className="flex items-center text-xs">
              <span title={totalIn} className="text-gray-10">
                {Number(totalIn) > 0 && Number(totalIn) < 0.01
                  ? "< 0.01"
                  : toPrecision(totalIn, 2)}
              </span>

              <span className="ml-1.5">{sellToken.symbol}</span>
              <span className="mx-6 xs:mx-2 text-white xs:text-gray-10">
                {isClientMobie() ? (
                  <MyOrderInstantSwapArrowRight />
                ) : (
                  <MyOrderInstantSwapArrowRight />
                )}
              </span>
              <span
                title={toPrecision(totalOut, buyToken.decimals)}
                className="text-gray-10"
              >
                {Number(totalOut) > 0 && Number(totalOut) < 0.01
                  ? "< 0.01"
                  : toPrecision(totalOut, 2)}
              </span>

              <span className="ml-1.5">{buyToken.symbol}</span>
            </span>
          </div>

          <div className="frcb px-4 pb-4">
            <span className="flex items-center ">
              <FormattedMessage
                id={isMobile() ? "filled_via_swap" : "instants_swap"}
                defaultMessage={isMobile() ? "Filled via swap" : "Instant Swap"}
              />
              {!isMobile() && (
                <ExclamationTip
                  colorhex="#7E8A93"
                  id={instant_swap_tip()}
                  defaultMessage={instant_swap_tip()}
                  dataPlace="bottom"
                  uniquenessId={"instant_swap_tip" + order.order_id}
                />
              )}
            </span>

            <span className="frcb xsm:justify-start lg:min-w-p300">
              <div className="frcs text-xs  pr-2 text-gray-10">
                <BsCheckCircle
                  className="mr-1.5"
                  fill="#42bb17"
                  stroke="#42BB17"
                />
                <span className="xsm:hidden">
                  <FormattedMessage
                    id="swappped"
                    defaultMessage={"Swapped"}
                  ></FormattedMessage>
                </span>
              </div>

              <div className="flex items-center justify-end">
                <span title={swapIn} className="text-gray-10">
                  {Number(swapIn) > 0 && Number(swapIn) < 0.01
                    ? "< 0.01"
                    : toPrecision(swapIn, 2)}
                </span>

                <span className="ml-1.5">{sellToken.symbol}</span>
                <span className="mx-6 xs:mx-2 text-gray-10">
                  {isClientMobie() ? (
                    <MyOrderInstantSwapArrowRight />
                  ) : (
                    <MyOrderInstantSwapArrowRight />
                  )}
                </span>
                <span title={swapOut} className="text-gray-10">
                  {Number(swapOut) > 0 && Number(swapOut) < 0.01
                    ? "< 0.01"
                    : toPrecision(swapOut, 2)}
                </span>

                <span className="ml-1.5">{buyToken.symbol}</span>
              </div>
            </span>
          </div>
        </>
      )}

      <div className="flex items-start xsm:hidden justify-between px-4 pb-4">
        <span className="xsm:text-gray-10">
          <FormattedMessage
            id="executing_capital"
            defaultMessage={"Executing"}
          />
        </span>

        <div className="flex flex-col items-end">
          <span className="frcb min-w-p300">
            <div className="frcs text-xs pr-2 text-gray-10">
              <BsCheckCircle
                className="mr-1.5"
                fill="#00D6AF"
                stroke="#00D6AF"
              />

              <FormattedMessage
                id="claimed"
                defaultMessage={"Claimed"}
              ></FormattedMessage>
            </div>

            <div className="flex items-center justify-end">
              <span
                title={toPrecision(claimedAmountIn, sellToken.decimals)}
                className="text-gray-10"
              >
                {Number(claimedAmountIn) > 0 && Number(claimedAmountIn) < 0.01
                  ? "< 0.01"
                  : toPrecision(claimedAmountIn, 2)}
              </span>

              <span className="ml-1.5 xsm:text-gray-10">
                {sellToken.symbol}
              </span>
              <span className="mx-6 xs:mx-2 text-gray-10">
                {isClientMobie() ? (
                  <MyOrderInstantSwapArrowRight />
                ) : (
                  <MyOrderInstantSwapArrowRight />
                )}
              </span>
              <span title={claimedAmount} className="text-gray-10">
                {Number(claimedAmount) > 0 && Number(claimedAmount) < 0.01
                  ? "< 0.01"
                  : toPrecision(claimedAmount, 2)}
              </span>

              <span className="ml-1.5 xsm:text-gray-10">{buyToken.symbol}</span>
            </div>
          </span>

          <span className=" pt-4  frcb min-w-p300">
            <div className="frcs text-xs pr-2 text-gray-10">
              <span className="mr-1.5">
                <FilledEllipse></FilledEllipse>
              </span>

              <FormattedMessage
                id="filled"
                defaultMessage={"Filled"}
              ></FormattedMessage>
            </div>

            <div className="flex items-center justify-end">
              <span
                title={toPrecision(unClaimedAmountIn, sellToken.decimals)}
                className="text-white font-gothamBold"
              >
                {Number(unClaimedAmountIn) > 0 &&
                Number(unClaimedAmountIn) < 0.01
                  ? "< 0.01"
                  : toPrecision(unClaimedAmountIn, 2)}
              </span>

              <span className="ml-1.5 xsm:text-gray-10">
                {sellToken.symbol}
              </span>
              <span className="mx-6 xs:mx-2 text-gray-10">
                {isClientMobie() ? (
                  <MyOrderInstantSwapArrowRight />
                ) : (
                  <MyOrderInstantSwapArrowRight />
                )}
              </span>
              <span
                title={unClaimedAmount}
                className="text-white font-gothamBold"
              >
                {Number(unClaimedAmount) > 0 && Number(unClaimedAmount) < 0.01
                  ? "< 0.01"
                  : toPrecision(unClaimedAmount, 2)}
              </span>

              <span className="ml-1.5 xsm:text-gray-10">{buyToken.symbol}</span>
            </div>
          </span>
        </div>
      </div>

      <div className="lg:hidden flex items-center justify-end pr-4 pb-2">
        <div className="flex  max-w-max text-gray-10 bg-black bg-opacity-20 rounded-md px-2 py-1 items-center justify-end lg:hidden">
          <span className="">1</span>

          <span className="ml-1.5">
            {sort ? buyToken.symbol : sellToken.symbol}
          </span>

          {allTokenPrices?.[sort ? buyToken?.id : sellToken?.id]?.price && (
            <span className="ml-1">{`($${
              allTokenPrices?.[sort ? buyToken?.id : sellToken?.id].price
            })`}</span>
          )}

          <span className="mx-6 xs:mx-2 ">=</span>
          <span className="">
            {toPrecision(
              scientificNotationToString(
                new Big(sort ? swapIn || 0 : swapOut || 0)
                  .div(
                    Number(sort ? swapOut : swapIn) === 0
                      ? 1
                      : sort
                      ? swapOut
                      : swapIn
                  )
                  .toString()
              ),
              3
            )}
          </span>

          <span className="ml-1.5">
            {sort ? sellToken.symbol : buyToken.symbol}
          </span>
        </div>
      </div>
    </td>
  );
}
