import { useEffect, useMemo } from "react";
import useOrderlyMarketData from "@/hooks/orderbook/ws/useOrderlyMarketData";
import useOrderlyPrivateData from "@/hooks/orderbook/ws/useOrderlyPrivateData";
import { useAllTokensInfo } from "@/services/orderbook/state";
import { useOrderbookPrivateWSDataStore } from "@/stores/orderbook/orderbookPrivateWSDataStore";
import { useOrderbookDataStore } from "@/stores/orderbook/orderbookDataStore";
import { TokenInfo } from "@/interfaces/orderbook";
import { getFTmetadata } from "@/services/orderbook/near";
import { useAccountExist } from "@/services/orderbook/state";
import { useAccountStore } from "@/stores/account";
import { checkConnectStatus } from "@/services/orderbook/contract";
import { get_orderly_public_key_path } from "@/utils/orderlyUtils";
import { generateTradingKeyPair } from "@/services/orderbook/utils";
import { useCurHoldings } from "@/services/orderbook/unknow/state";
import { getAccountInformation } from "@/services/orderbook/off-chain-api";
import { useAllPositions } from "@/services/orderbook/state";
import { useAllSymbolInfo } from "@/services/orderbook/unknow/state";
export default function InitData(props: any) {
  const orderbookPrivateWSDataStore = useOrderbookPrivateWSDataStore();
  const orderbookDataStore = useOrderbookDataStore();
  const accountStore = useAccountStore();
  const userExist = useAccountExist();
  const accountId = accountStore.getAccountId();
  // const validAccountSig = orderbookDataStore.getValidAccountSig();
  const connectStatus = orderbookDataStore.getConnectStatus();
  const validAccountSig = connectStatus == "has_connected";
  // TODO Temporary Hide
  // get account websocket data
  useOrderlyPrivateData({
    validAccountSig,
  });
  // get all positions
  // useAllPositions(validAccountSig);
  // get websocket data
  useOrderlyMarketData({
    symbol: "SPOT_NEAR_USDC.e", // TOOD Wait for processing
  });
  // get account holdings
  useCurHoldings(validAccountSig, orderbookPrivateWSDataStore.getBalances());
  // get all tokens support
  useAllTokensInfo();
  // get all SymbolInfo
  useAllSymbolInfo();
  // get connect status
  useEffect(() => {
    if (accountId) {
      checkConnectStatus().then((res) => {
        orderbookDataStore.setConnectStatus(res);
      });
    }
  }, [accountId]);
  // get userInfo
  useEffect(() => {
    if (!validAccountSig || !accountId) return;
    getAccountInformation({ accountId }).then((res) => {
      if (!!res) {
        orderbookDataStore.setUserInfo(res);
      }
    });
  }, [validAccountSig, accountId]);
  // generate trading key
  useEffect(() => {
    const pubkey = localStorage.getItem(get_orderly_public_key_path());
    if (!pubkey && accountId) {
      generateTradingKeyPair();
    }
  }, [accountId]);
  useEffect(() => {
    if (accountId) {
      orderbookDataStore.setUserExists(!!userExist);
    }
  }, [userExist, accountId]);
  return null;
}
