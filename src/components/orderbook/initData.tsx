import { useEffect, useMemo } from "react";
import useOrderlyMarketData from "@/hooks/orderbook/useOrderlyMarketData";
import { useTokenInfo } from "@/services/orderbook/state";
import { useOrderbookDataStore } from "@/stores/orderbook";
import { TokenInfo } from "@/interfaces/orderbook";
import { getFTmetadata } from "@/services/orderbook/near";
export default function InitData(props: any) {
  const orderbookDataStore = useOrderbookDataStore();
  useOrderlyMarketData({
    symbol: "SPOT_NEAR_USDC.e",
  });
  const tokensInfo = useTokenInfo();
  useEffect(() => {
    if (tokensInfo.length > 0) {
      storeTokensInfo(tokensInfo);
    }
  }, [tokensInfo.length]);
  async function storeTokensInfo(tokensInfo: TokenInfo[]) {
    const pending = tokensInfo.map((t) => getFTmetadata(t.token_account_id));
    const metadatas = await Promise.all(pending);
    const map = tokensInfo.reduce((acc, cur, index) => {
      return {
        ...acc,
        [cur.token]: metadatas[index],
      };
    }, {});
    orderbookDataStore.setTokensInfo(tokensInfo);
    orderbookDataStore.setTokensMetaMap(map);
  }
  return null;
}
