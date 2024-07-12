import { create } from "zustand";
import { IChartTab, IOrderPointItem } from "@/interfaces/limit";
import { GEARS } from "@/services/limit/limitUtils";
export interface ILimitRateChart {
  getChartTab: () => IChartTab;
  setChartTab: (chartTab: IChartTab) => void;
}
export interface ILimitOrderChart {
  get_buy_list: () => IOrderPointItem[];
  set_buy_list: (buy_list: IOrderPointItem[]) => void;
  get_sell_list: () => IOrderPointItem[];
  set_sell_list: (sell_list: IOrderPointItem[]) => void;
  get_cur_pairs: () => string;
  set_cur_pairs: (cur_pairs: string) => void;
  get_cur_token_symbol: () => string;
  set_cur_token_symbol: (cur_token_symbol: string) => void;
  get_zoom: () => number;
  set_zoom: (zoom: number) => void;
}

export const useLimitRateChartStore = create<ILimitRateChart>(
  (set: any, get: any) => ({
    chartTab: "PRICE",
    getChartTab: () => get().chartTab,
    setChartTab: (chartTab: IChartTab) =>
      set({
        chartTab,
      }),
  })
);

export const useLimitOrderChartStore = create<ILimitOrderChart>(
  (set: any, get: any) => ({
    buy_list: [],
    sell_list: [],
    cur_pairs: "",
    cur_token_symbol: "",
    zoom: GEARS[0],
    get_buy_list: () => get().buy_list,
    set_buy_list: (buy_list: IOrderPointItem[]) =>
      set({
        buy_list,
      }),
    get_sell_list: () => get().sell_list,
    set_sell_list: (sell_list: IOrderPointItem[]) =>
      set({
        sell_list,
      }),
    get_cur_pairs: () => get().cur_pairs,
    set_cur_pairs: (cur_pairs: string) =>
      set({
        cur_pairs,
      }),
    get_cur_token_symbol: () => get().cur_token_symbol,
    set_cur_token_symbol: (cur_token_symbol: string) =>
      set({
        cur_token_symbol,
      }),
    get_zoom: () => get().zoom,
    set_zoom: (zoom: number) =>
      set({
        zoom,
      }),
  })
);
