import React, { useEffect, useMemo, useState, useRef } from "react";
import Big from "big.js";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { get_pointorder_range, get_pool } from "@/services/swapV3";
import { ftGetTokenMetadata } from "@/services/token";
import { getPriceByPoint } from "../../services/commonV3";
import { toReadableNumber } from "../../utils/numbers";
import { isMobile } from "@/utils/device";
import { usePersistLimitStore, IPersistLimitStore } from "@/stores/limitOrder";
import { formatPriceWithCommas } from "@/components/pools/detail/dcl/d3Chart/utils";
import { IOrderPoint, ISwitchToken, IOrderPointItem } from "@/interfaces/limit";
import { EmptyIcon, AddIcon, SubIcon, RefreshIcon } from "./icons2";
import { formatNumber, GEARS } from "@/services/limit/limitUtils";
import { useLimitOrderChartStore } from "@/stores/limitChart";
import { useLimitStore } from "@/stores/limitOrder";
import { IPoolDcl } from "@/interfaces/swapDcl";
import { sort_tokens_by_base } from "@/services/commonV3";
const LimitOrderChart = dynamic(() => import("./LimitOrderChart"), {
  ssr: false,
});

export default function LimitOrderChartAndTable() {
  // CONST start
  const limitOrderContainerHeight = "150";
  // CONST end
  const [orders, setOrders] = useState<IOrderPoint>();
  const [switch_token, set_switch_token] = useState<ISwitchToken>();
  const [buy_token_x_list, set_buy_token_x_list] =
    useState<IOrderPointItem[]>();
  const [sell_token_x_list, set_sell_token_x_list] =
    useState<IOrderPointItem[]>();
  const [buy_token_y_list, set_buy_token_y_list] =
    useState<IOrderPointItem[]>();
  const [sell_token_y_list, set_sell_token_y_list] =
    useState<IOrderPointItem[]>();
  const [fetch_data_done, set_fetch_data_done] = useState(false);
  const [market_loading, set_market_loading] = useState<boolean>(false);
  const [show_view_all, set_show_view_all] = useState<boolean>(false);
  const persistLimitStore: IPersistLimitStore = usePersistLimitStore();
  const limitOrderChartStore = useLimitOrderChartStore();
  const limitStore = useLimitStore();
  const tokenIn = limitStore.getTokenIn();
  const tokenOut = limitStore.getTokenOut();
  const buy_list = limitOrderChartStore.get_buy_list();
  const sell_list = limitOrderChartStore.get_sell_list();
  const zoom = limitOrderChartStore.get_zoom();
  const pool = persistLimitStore.getDclPool();
  const pool_id = persistLimitStore.getDclPool()?.pool_id;
  const left_point = -800000;
  const right_point = 800000;
  const sellBoxRef: any = useRef(null);
  const is_mobile = isMobile();
  useEffect(() => {
    if (pool_id) {
      set_fetch_data_done(false);
      limitOrderChartStore.set_zoom(GEARS[0]);
      fetch_points_data();
    }
  }, [pool_id]);
  useEffect(() => {
    if (!(tokenIn && tokenOut && pool_id && fetch_data_done)) return;
    const { token_x, token_y } = pool;
    if (tokenIn.id == token_x && tokenOut.id == token_y) {
      set_switch_token("X");
    }
    if (tokenIn.id == token_y && tokenOut.id == token_x) {
      set_switch_token("Y");
    }
  }, [tokenIn?.id, tokenOut?.id, pool_id, fetch_data_done]);
  useEffect(() => {
    if (orders) {
      process_orders(orders);
    }
  }, [JSON.stringify(orders || {})]);
  useEffect(() => {
    if (
      switch_token == "X" &&
      buy_token_x_list &&
      sell_token_x_list &&
      fetch_data_done
    ) {
      limitOrderChartStore.set_buy_list(buy_token_x_list);
      limitOrderChartStore.set_sell_list(sell_token_x_list);
    } else if (
      switch_token == "Y" &&
      buy_token_y_list &&
      sell_token_y_list &&
      fetch_data_done
    ) {
      limitOrderChartStore.set_buy_list(buy_token_y_list);
      limitOrderChartStore.set_sell_list(sell_token_y_list);
    }
  }, [
    switch_token,
    buy_token_x_list,
    sell_token_x_list,
    buy_token_y_list,
    sell_token_y_list,
    fetch_data_done,
  ]);
  useEffect(() => {
    if (sellBoxRef.current && sell_list?.length) {
      sellBoxRef.current.scrollTop = 10000;
    }
  }, [sellBoxRef, sell_list]);
  const [cur_pairs, , cur_token_symbol] = useMemo(() => {
    if (pool_id) {
      const classStr = "w-6 h-6 rounded-full border border-gradientFromHover";
      const { token_x_metadata, token_y_metadata } = pool;
      const x_symbol = token_x_metadata!.symbol;
      const y_symbol = token_y_metadata!.symbol;
      if (switch_token == "X") {
        const y_icons = (
          <>
            <img className={classStr} src={token_x_metadata!.icon}></img>
            <img
              className={`${classStr} -ml-1.5`}
              src={token_y_metadata!.icon}
            ></img>
          </>
        );
        return [
          `${y_symbol}/${x_symbol}`,
          `${x_symbol}-${y_symbol}`,
          `${x_symbol}`,
          y_icons,
        ];
      } else if (switch_token == "Y") {
        const x_icons = (
          <>
            <img className={classStr} src={token_y_metadata!.icon}></img>
            <img
              className={`${classStr} -ml-1.5`}
              src={token_x_metadata!.icon}
            ></img>
          </>
        );
        return [
          `${x_symbol}/${y_symbol}`,
          `${y_symbol}-${x_symbol}`,
          `${y_symbol}`,
          x_icons,
        ];
      }
    }
    return [];
  }, [switch_token, pool_id]);
  useEffect(() => {
    limitOrderChartStore.set_cur_pairs(cur_pairs!);
    limitOrderChartStore.set_cur_token_symbol(cur_token_symbol!);
  }, [cur_pairs, cur_token_symbol]);
  useEffect(() => {
    if (show_view_all && is_mobile) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "auto";
    }
  }, [show_view_all]);

  async function fetch_points_data() {
    const orders = await get_points_of_orders();
    setOrders(orders);
    set_fetch_data_done(true);
    setSwitchToken();
  }
  async function setSwitchToken() {
    const { token_x_metadata, token_y_metadata } = pool;
    const tokens = sort_tokens_by_base([token_x_metadata!, token_y_metadata!]);
    if (tokens[0].id == token_x_metadata!.id) {
      set_switch_token("X");
    } else {
      set_switch_token("Y");
    }
  }
  async function get_points_of_orders() {
    const result = await get_pointorder_range({
      pool_id,
      left_point,
      right_point,
    });
    return result;
  }
  async function getPool() {
    const p: IPoolDcl = (await get_pool(pool_id))!;
    const { token_x, token_y } = p;
    p.token_x_metadata = await ftGetTokenMetadata(token_x!);
    p.token_y_metadata = await ftGetTokenMetadata(token_y!);
    return p;
  }
  function process_orders(orders: Record<string, IOrderPointItem>) {
    const list = Object.values(orders!);
    const sell_token_x_list: IOrderPointItem[] = [];
    const sell_token_y_list: IOrderPointItem[] = [];
    const buy_token_x_list: IOrderPointItem[] = [];
    const buy_token_y_list: IOrderPointItem[] = [];
    const list_x = list.filter((item: IOrderPointItem) =>
      Big(item.amount_x!).gt(0)
    );
    list_x.sort((b: IOrderPointItem, a: IOrderPointItem) => {
      return b.point! - a.point!;
    });
    const list_y = list
      .filter((item: IOrderPointItem) => Big(item.amount_y!).gt(0))
      .reverse();
    const { token_x_metadata, token_y_metadata } = pool!;
    list_y.sort((b: IOrderPointItem, a: IOrderPointItem) => {
      return a.point! - b.point!;
    });
    // accumulate
    list_x.forEach((item: IOrderPointItem) => {
      const { point, amount_x } = item;
      const price_x_base = get_price_by_point(point!);
      const price_y_base = Big(price_x_base).eq(0)
        ? "0"
        : Big(1).div(price_x_base).toFixed();
      const sell_x_readable = toReadableNumber(
        token_x_metadata!.decimals,
        amount_x
      );
      const buy_y_readable = Big(price_x_base).mul(sell_x_readable).toFixed();
      const length_sell_token_x_list = sell_token_x_list.length;
      const length_buy_token_y_list = sell_token_x_list.length;
      sell_token_x_list.push({
        ...item,
        price: price_x_base,
        amount_x_readable: sell_x_readable,
        accumulated_x_readable:
          length_sell_token_x_list == 0
            ? sell_x_readable
            : Big(
                sell_token_x_list[length_sell_token_x_list - 1]
                  .accumulated_x_readable!
              )
                .plus(sell_x_readable)
                .toFixed(),
      });
      buy_token_y_list.push({
        ...item,
        price: price_y_base,
        amount_y_readable: buy_y_readable,
        accumulated_y_readable:
          length_buy_token_y_list == 0
            ? buy_y_readable
            : Big(
                buy_token_y_list[length_buy_token_y_list - 1]
                  .accumulated_y_readable!
              )
                .plus(buy_y_readable)
                .toFixed(),
      });
    });
    list_y.forEach((item: IOrderPointItem) => {
      const { point, amount_y } = item;
      const price_x_base = get_price_by_point(point!);
      const price_y_base = Big(price_x_base).eq(0)
        ? "0"
        : Big(1).div(price_x_base).toFixed();
      const sell_y_readable = toReadableNumber(
        token_y_metadata!.decimals,
        amount_y
      );
      const buy_x_readable = Big(price_y_base).mul(sell_y_readable).toFixed();
      const length_sell_token_y_list = sell_token_y_list.length;
      const length_buy_token_x_list = buy_token_x_list.length;
      sell_token_y_list.push({
        ...item,
        price: price_y_base,
        amount_y_readable: sell_y_readable,
        accumulated_y_readable:
          length_sell_token_y_list == 0
            ? sell_y_readable
            : Big(
                sell_token_y_list[length_sell_token_y_list - 1]
                  .accumulated_y_readable!
              )
                .plus(sell_y_readable)
                .toFixed(),
      });
      buy_token_x_list.push({
        ...item,
        price: price_x_base,
        amount_x_readable: buy_x_readable,
        accumulated_x_readable:
          length_buy_token_x_list == 0
            ? buy_x_readable
            : Big(
                buy_token_x_list[length_buy_token_x_list - 1]
                  .accumulated_x_readable!
              )
                .plus(buy_x_readable)
                .toFixed(),
      });
    });
    const sell_token_x_list_reverse = sell_token_x_list.reverse();
    const sell_token_y_list_reverse = sell_token_y_list.reverse();
    set_buy_token_x_list(buy_token_x_list);
    set_sell_token_x_list(sell_token_x_list_reverse);
    set_buy_token_y_list(buy_token_y_list);
    set_sell_token_y_list(sell_token_y_list_reverse);
  }
  function get_price_by_point(point: number) {
    const { token_x_metadata, token_y_metadata } = pool!;
    const decimalRate_price =
      Math.pow(10, token_x_metadata!.decimals) /
      Math.pow(10, token_y_metadata!.decimals);
    return getPriceByPoint(point, decimalRate_price);
  }
  function get_rate_element() {
    if (pool) {
      const { current_point, token_x_metadata, token_y_metadata } = pool;
      const current_price_x = get_price_by_point(current_point);
      const current_price_y = Big(current_price_x).gt(0)
        ? Big(1).div(current_price_x).toFixed()
        : "0";
      return (
        <div className="flex items-center">
          <span className="text-sm text-gray-60">
            1{" "}
            {switch_token == "X"
              ? token_x_metadata!.symbol
              : token_y_metadata!.symbol}{" "}
            =
          </span>
          <span className="text-2xl text-white font-bold px-2.5">
            {switch_token == "X"
              ? formatPriceWithCommas(current_price_x)
              : formatPriceWithCommas(current_price_y)}
          </span>
          <span className="text-sm text-gray-60">
            {switch_token == "X"
              ? token_y_metadata!.symbol
              : token_x_metadata!.symbol}
          </span>
        </div>
      );
    }
  }
  function get_rate_element_mobile() {
    if (pool) {
      const { current_point, token_x_metadata, token_y_metadata } = pool;
      const current_price_x = get_price_by_point(current_point);
      const current_price_y = Big(current_price_x).gt(0)
        ? Big(1).div(current_price_x).toFixed()
        : "0";
      return (
        <div className="flex items-center">
          <span className="text-2xl text-senderHot gotham_bold mx-1.5">
            {switch_token == "X"
              ? formatPriceWithCommas(current_price_x)
              : formatPriceWithCommas(current_price_y)}
          </span>
          <span className="text-sm text-primaryText">
            {switch_token == "X"
              ? token_y_metadata!.symbol + "/" + token_x_metadata!.symbol
              : token_x_metadata!.symbol + "/" + token_y_metadata!.symbol}
          </span>
        </div>
      );
    }
  }
  async function fetch_data() {
    const orders = await get_points_of_orders();
    const p = (await getPool()) as IPoolDcl;
    setOrders(orders);
    persistLimitStore.setDclPool(p);
    set_market_loading(false);
  }
  async function marketRefresh() {
    set_market_loading(true);
    await fetch_data();
  }
  // Zoom out the axis range
  function zoomOut() {
    if (is_empty) return;
    const targetPercent = GEARS.find((item) => item < zoom);
    if (targetPercent) {
      limitOrderChartStore.set_zoom(targetPercent);
    }
  }
  // Zoom in on the axis range
  function zoomIn() {
    if (is_empty) return;
    const GEARSCOPY: number[] = JSON.parse(JSON.stringify(GEARS)).reverse();
    const targetPercent = GEARSCOPY.find((item) => item > zoom);
    if (targetPercent) {
      limitOrderChartStore.set_zoom(targetPercent);
    }
  }
  const is_empty = fetch_data_done && !sell_list?.length && !buy_list?.length;
  const variants = {
    static: { transform: "rotate(0deg)" },
    spin: {
      transform: "rotate(360deg)",
      transition: { duration: 1, repeat: Infinity, ease: "linear" },
    },
  };
  return (
    <div className="flex items-stretch justify-between">
      {/* chart area */}
      <div className="flex-grow px-3 xsm:w-full pt-2.5">
        {/* base data */}
        <div className="flex items-center xsm:items-start justify-between xsm:flex-col-reverse">
          <div className="flex items-end xsm:hidden">{get_rate_element()}</div>
          <div className="flex items-end lg:hidden mt-2.5">
            {get_rate_element_mobile()}
          </div>
          <div className="flex items-center justify-between xsm:w-full">
            {/* control button*/}
            <div className="control flex items-center border border-gray-70 rounded py-px h-5 w-12">
              <div
                className={`flex items-center justify-center w-1 h-full flex-grow border-r border-gray-70 text-gray-10 ${
                  zoom == GEARS[GEARS.length - 1] || is_empty
                    ? "text-opacity-30 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                onClick={zoomOut}
              >
                <AddIcon></AddIcon>
              </div>
              <div
                className={`flex items-center justify-center w-1 h-full flex-grow text-gray-10 ${
                  zoom == GEARS[0] || is_empty
                    ? "text-opacity-30 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                onClick={zoomIn}
              >
                <SubIcon></SubIcon>
              </div>
            </div>
            <div
              onClick={() => {
                set_show_view_all(true);
              }}
              className="text-xs text-white px-2 py-1 border border-v3SwapGray border-opacity-20 rounded-md lg:hidden"
            >
              View All
            </div>
          </div>
        </div>
        {/* chart */}
        {is_empty ? (
          <div
            className="flex flex-col items-center justify-center gap-5"
            style={{ height: "400px" }}
          >
            <EmptyIcon></EmptyIcon>
            <span className="text-sm text-gray-60">
              Not enough data for the chart right now.
            </span>
          </div>
        ) : (
          <LimitOrderChart />
        )}
      </div>
      {/* table area */}
      <div className="lg:border-l lg:border-gray-30 pt-2.5">
        {is_mobile && show_view_all && (
          <div
            className="fixed w-screen h-screen top-0 left-0"
            style={{
              zIndex: 150,
              background: "rgba(0, 19, 32, 0.8)",
              position: "fixed",
            }}
            onClick={() => {
              set_show_view_all(false);
            }}
          ></div>
        )}
        <div
          className={`xsm:fixed xsm:bottom-8 xsm:bg-cardBg xsm:rounded-t-xl xsm:left-0 xsm:border xsm:border-bottomBoxBorderColor xsm:pt-5 ${
            (show_view_all && is_mobile) || !is_mobile ? "" : "hidden"
          }`}
          style={{
            width: is_mobile ? "100%" : "260px",
            zIndex: is_mobile ? "999" : "",
          }}
        >
          <div className="text-sm text-white font-extrabold pl-3">
            Limit Orders
          </div>
          <div className="flex items-center justify-between p-3 xsm:px-5 border-b border-limitOrderFeeTiersBorderColor">
            <div className="flex flex-col">
              <span className="text-sm text-gray-180">Price</span>
              <span className="text-xs text-gray-180" style={{ zoom: 0.85 }}>
                {cur_pairs}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-180">Qty</span>
              <span className="text-xs text-gray-180" style={{ zoom: 0.85 }}>
                {cur_token_symbol}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-180 whitespace-nowrap">
                Total Qty
              </span>
              <span className="text-xs text-gray-180" style={{ zoom: 0.85 }}>
                {cur_token_symbol}
              </span>
            </div>
          </div>
          {is_empty ? (
            <div
              className="text-sm text-gray-60 flex items-center justify-center"
              style={{ marginTop: "100px" }}
            >
              No order yet
            </div>
          ) : (
            <div>
              <div
                ref={sellBoxRef}
                className={`font-nunito ${
                  sell_list?.length ? "p-3 xsm:px-5" : "p-1"
                } pr-0 overflow-auto`}
                style={{ maxHeight: `${limitOrderContainerHeight}px` }}
              >
                {sell_list?.map((item: IOrderPointItem, index) => {
                  return (
                    <div
                      key={item.point! + index}
                      className="grid grid-cols-3  justify-items-end text-xs py-1.5 pr-2"
                    >
                      <span className="text-red-20 justify-self-start">
                        {formatPriceWithCommas(item.price!)}
                      </span>
                      <span className="text-white pr-3">
                        {formatNumber(
                          item.amount_x_readable! || item.amount_y_readable!
                        )}
                      </span>
                      <span className="text-white">
                        {formatNumber(
                          item.accumulated_x_readable! ||
                            item.accumulated_y_readable!
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center mt-2.5 pl-3 xsm:pl-5 font-nunito">
                <div className="flex items-center xsm:hidden">
                  <span className="text-xs text-white mr-2">Market Pirce</span>
                  <div
                    className="flex items-center justify-center w-4 h-4 rounded border border-r-gray-90 cursor-pointer text-gray-50 hover:text-white"
                    onClick={marketRefresh}
                  >
                    {market_loading ? (
                      <motion.div variants={variants} animate="spin">
                        <RefreshIcon className="text-white" />
                      </motion.div>
                    ) : (
                      <RefreshIcon />
                    )}
                  </div>
                </div>
                <span
                  className="lg:hidden text-sm text-white underline"
                  onClick={marketRefresh}
                >
                  Refresh Market Price
                </span>
              </div>
              <div
                className={`font-nunito ${
                  buy_list?.length ? "p-3 xsm:px-5" : "p-1"
                } pr-0 overflow-auto`}
                style={{ maxHeight: `${limitOrderContainerHeight}px` }}
              >
                {buy_list?.map((item: IOrderPointItem, index) => {
                  return (
                    <div
                      key={item.point! + index}
                      className="grid grid-cols-3 justify-items-end text-xs py-1.5 pr-2"
                    >
                      <span className="text-primaryGreen justify-self-start">
                        {formatPriceWithCommas(item.price!)}
                      </span>
                      <span className="text-white pr-3">
                        {formatNumber(
                          item.amount_x_readable! || item.amount_y_readable!
                        )}
                      </span>
                      <span className="text-white">
                        {formatNumber(
                          item.accumulated_x_readable! ||
                            item.accumulated_y_readable!
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
