export interface TokenPairRate {
  symbol: string;
  contract_address: string;
  price_list: PriceList[];
}
export interface PriceList {
  price: number;
  date_time: number;
}

export interface Diff {
  percent: string;
  direction: "down" | "up" | "unChange";
  curPrice: number;
  h24Hight: number;
  h24Low: number;
  lastUpdate: string;
}

export type IChartTab = "PRICE" | "ORDER";
export interface IOrderPoint {
  [point: string]: IOrderPointItem;
}
export interface IOrderPointItem {
  point?: number;
  amount_x?: string;
  amount_y?: string;
  price?: string;
  amount_x_readable?: string;
  amount_y_readable?: string;
  accumulated_x_readable?: string;
  accumulated_y_readable?: string;
}

export type ISwitchToken = "X" | "Y";
export type ISide = "buy" | "sell";
