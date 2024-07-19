import useOrderlyMarketData from "@/hooks/orderbook/useOrderlyMarketData";
export default function OrderlyMarketData(props: any) {
  useOrderlyMarketData({
    symbol: "SPOT_NEAR_USDC.e",
  });
  return null;
}
