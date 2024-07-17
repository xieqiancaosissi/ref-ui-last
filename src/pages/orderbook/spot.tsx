import OrderBookTab from "@/components/orderbook/orderBookTab";
import CreateOrder from "@/components/orderbook/spot/createOrder";
import Account from "@/components/orderbook/spot/account";
import { useSpotStore } from "@/stores/spot";
export default function Spot(props: any) {
  const spotStore = useSpotStore();
  const orderTab = spotStore.getOrderTab();
  const isLimit = orderTab == "LIMIT";
  const isMarket = orderTab == "MARKET";
  return (
    <div className="flex justify-between p-6 gap-7">
      {/* left part */}
      <div className="flex-grow">
        <OrderBookTab />
      </div>
      {/* right part */}
      <div style={{ width: "350px" }}>
        <CreateOrder />
        <Account />
      </div>
    </div>
  );
}
