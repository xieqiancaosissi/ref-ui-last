import { useEffect, useMemo } from "react";
import useOrderlyMarketData from "@/hooks/orderbook/useOrderlyMarketData";
import { useTokenInfo } from "@/services/orderbook/state";
import { useOrderbookDataStore } from "@/stores/orderbook";
import { TokenInfo } from "@/interfaces/orderbook";
import { getFTmetadata } from "@/services/orderbook/near";
import { useAccountExist } from "@/services/orderbook/state";
import { useAccountStore } from "@/stores/account";
import { checkConnectStatus } from "@/services/orderbook/contract";
import { get_orderly_public_key_path } from "@/utils/orderlyUtils";
import { generateTradingKeyPair } from "@/services/orderbook/utils";
export default function InitData(props: any) {
  const orderbookDataStore = useOrderbookDataStore();
  const accountStore = useAccountStore();
  const userExist = useAccountExist();
  const accountId = accountStore.getAccountId();
  // get websocket data
  useOrderlyMarketData({
    symbol: "SPOT_NEAR_USDC.e",
  });
  // get all tokens support
  const tokensInfo = useTokenInfo();
  useEffect(() => {
    if (accountId) {
      checkConnectStatus().then((res) => {
        orderbookDataStore.setConnectStatus(res);
        console.log("9999999999-res", res);
      });
    }
  }, [accountId]);
  // generate trading key
  useEffect(() => {
    const pubkey = localStorage.getItem(get_orderly_public_key_path());
    if (!pubkey && accountId) {
      generateTradingKeyPair();
    }
  }, [accountId]);
  useEffect(() => {
    if (tokensInfo.length > 0) {
      storeTokensInfo(tokensInfo);
    }
  }, [tokensInfo.length]);
  useEffect(() => {
    if (accountId) {
      orderbookDataStore.setUserExists(!!userExist);
    }
  }, [userExist, accountId]);
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
