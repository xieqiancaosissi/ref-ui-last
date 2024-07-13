import { FormattedMessage } from "react-intl";
import Big from "big.js";
import { UserOrderInfo } from "@/services/swapV3";
import { toPrecision, ONLY_ZEROS } from "@/utils/numbers";
import ExclamationTip from "../exclamationTip";
import { TokenMetadata } from "@/services/ft-contract";
import { isClientMobie } from "@/utils/device";
import { MyOrderInstantSwapArrowRight } from "../../icons2";
import { BsCheckCircle } from "@/components/reactIcons";
import { useSwapStore } from "@/stores/swap";
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
      className=" rounded-b-xl xsm:hidden  w-full relative bottom-1.5 pt-6 bg-gray-20 bg-opacity-20"
    >
      {new Big(order.original_deposit_amount || "0")
        .minus(order.original_amount || "0")
        .gt(0) && (
        <>
          <div className="flex items-center px-4 pb-4 justify-between ">
            <span className="flex items-center">
              <FormattedMessage
                id="initial_order"
                defaultMessage={"Initial Order"}
              />
              <ExclamationTip
                id="this_order_has_been_partially_filled"
                defaultMessage="This order has been partially filled "
                dataPlace="bottom"
                colorhex="#7E8A93"
                uniquenessId={
                  "this_order_has_been_partially_filled" + order.order_id
                }
              />
            </span>

            <span className="flex items-center">
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
                id="instants_swap"
                defaultMessage={"Instant Swap"}
              />

              <ExclamationTip
                colorhex="#7E8A93"
                id={instant_swap_tip()}
                defaultMessage={instant_swap_tip()}
                dataPlace="bottom"
                uniquenessId={"instant_swap_tip" + order.order_id}
              />
            </span>

            <span className="frcb min-w-p300">
              <div className="frcs text-xs w pr-2 text-gray-10">
                <BsCheckCircle
                  className="mr-1.5"
                  fill="#42bb17"
                  stroke="#42BB17"
                />

                <FormattedMessage
                  id="swappped"
                  defaultMessage={"Swapped"}
                ></FormattedMessage>
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
      {Number(claimedAmountIn) > 0 && (
        <div className="frcb px-4 pb-4">
          <span>
            <FormattedMessage id="executed" defaultMessage={"Executed"} />
          </span>

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

              <span className="ml-1.5">{sellToken.symbol}</span>
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

              <span className="ml-1.5">{buyToken.symbol}</span>
            </div>
          </span>
        </div>
      )}
    </td>
  );
}
