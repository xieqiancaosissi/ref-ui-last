import dynamic from "next/dynamic";
import OrderBookTab from "@/components/orderbook/orderBookTab";
import CreateOrder from "@/components/orderbook/spot/createOrder";
import Account from "@/components/orderbook/spot/account";
// TODO
const InitData = dynamic(() => import("@/components/orderbook/initData"), {
  ssr: false,
});
const CurrentSymbol = dynamic(
  () => import("@/components/orderbook/spot/currentSymbol"),
  {
    ssr: false,
  }
);
export default function Spot(props: any) {
  return (
    <div className="flex items-start justify-between p-6 gap-7">
      <InitData />
      {/* left part */}
      <div className="flex items-center flex-grow gap-5">
        <OrderBookTab />
        <CurrentSymbol />
      </div>
      {/* right part */}
      <div style={{ width: "350px" }}>
        <CreateOrder />
        <Account />
      </div>
    </div>
  );
}
