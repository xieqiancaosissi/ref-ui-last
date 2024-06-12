import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  useContext,
  createContext,
} from "react";

import {
  RefFiFunctionCallOptions,
  wallet,
  getGas,
  getAmount,
  RefFiViewFunctionOptions,
} from "./near";
import metadataDefaults from "../utils/metadata";
import { storageDepositForFTAction } from "./creators/storage";
import db from "../store/RefDatabase";
import { getCurrentWallet, WALLET_TYPE } from "../utils/wallets-integration";
import getConfig from "./config";
import { nearMetadata, WRAP_NEAR_CONTRACT_ID } from "./wrap-near";
import { REF_TOKEN_ID, getAccountNearBalance } from "./near";
import getConfigV2 from "./configV2";
const configV2 = getConfigV2();

export const NEAR_ICON =
  "https://near.org/wp-content/themes/near-19/assets/img/brand-icon.png";
const BANANA_ID = "berryclub.ek.near";
const CHEDDAR_ID = "token.cheddar.near";
const CUCUMBER_ID = "farm.berryclub.ek.near";
const HAPI_ID = "d9c2d319cd7e6177336b0a9c93c21cb48d84fb54.factory.bridge.near";
const WOO_ID = "4691937a7508860f876c9c0a2a617e7d9e945d4b.factory.bridge.near";
const SOL_ID = "sol.token.a11bd.near";
const FRAX_ID = "853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near";
const BLACKDRAGON_ID = "blackdragon.tkn.near";
const SOL_NATIVE_ID = "22.contract.portalbridge.near";

export const REF_META_DATA = {
  decimals: 18,
  icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='16 24 248 248' style='background: %23000'%3E%3Cpath d='M164,164v52h52Zm-45-45,20.4,20.4,20.6-20.6V81H119Zm0,18.39V216h41V137.19l-20.6,20.6ZM166.5,81H164v33.81l26.16-26.17A40.29,40.29,0,0,0,166.5,81ZM72,153.19V216h43V133.4l-11.6-11.61Zm0-18.38,31.4-31.4L115,115V81H72ZM207,121.5h0a40.29,40.29,0,0,0-7.64-23.66L164,133.19V162h2.5A40.5,40.5,0,0,0,207,121.5Z' fill='%23fff'/%3E%3Cpath d='M189 72l27 27V72h-27z' fill='%2300c08b'/%3E%3C/svg%3E%0A",
  id: getConfig().REF_TOKEN_ID,
  name: "Ref Finance Token",
  symbol: "REF",
};

export const ftFunctionCall = (
  tokenId: string,
  { methodName, args, gas, amount }: RefFiFunctionCallOptions
) => {
  return wallet
    .account()
    .functionCall(tokenId, methodName, args, getGas(gas), getAmount(amount));
};

const ftGetTokenMetadata = ftViewFunction(id, {
  methodName: "ft_metadata",
});

export const usePoolTokens = (pools: Array<any>[]) => {
  const [poolTokens, setPoolTokens] = useState({});
  useEffect(() => {
    if (!pools.length) return;
    getPoolTokens(pools);
  }, [pools]);
  async function getPoolTokens(pools) {
    const copyPools = JSON.parse(JSON.stringify(pools || []));
    const allRequest = copyPools.map(async (p) => {
      return await Promise.all(
        p.tokenIds.map((id) => {
          return ftGetTokenMetadata(id);
        })
      );
    });
    const result = await Promise.all(allRequest);
    const last = result.reduce((pre, cur, i) => {
      return {
        ...pre,
        [copyPools[i].id]: cur,
      };
    }, {});
    setPoolTokens(last);
  }
  return poolTokens;
};
