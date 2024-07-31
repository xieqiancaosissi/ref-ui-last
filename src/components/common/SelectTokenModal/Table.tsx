import React, { useContext, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import Big from "big.js";
import { CollectIcon, EmptyIcon, RiskIcon } from "./Icons";
import { ITokenMetadata } from "@/interfaces/tokens";
import { useAccountStore } from "../../../stores/account";
import { toPrecision } from "../../../utils/numbers";
import { toInternationalCurrencySystem_usd } from "../../../utils/uiNumber";
import { ButtonTextWrapper } from "../Button";
import { useTokenStore, ITokenStore } from "../../../stores/token";
import { useSwapStore } from "../../../stores/swap";
import { SelectTokenContext } from "./Context";
import { TokenMetadata } from "@/services/ft-contract";
import registerTokenAndExchange from "@/services/swap/registerToken";

type ISort = "asc" | "desc";
export default function Table({
  tokens,
  sort,
  hidden,
  enableAddToken,
}: {
  tokens: ITokenMetadata[];
  sort: ISort;
  hidden: boolean;
  enableAddToken?: boolean;
}) {
  const [addTokenLoading, setAddTokenLoading] = useState<boolean>(false);
  const { onSelect, onRequestClose, searchText, setAddTokenError } =
    useContext(SelectTokenContext);
  const tokenStore = useTokenStore() as ITokenStore;
  const common_tokens = tokenStore.get_common_tokens();
  const accountStore = useAccountStore();
  const swapStore = useSwapStore();
  const allTokenPrices = swapStore.getAllTokenPrices();
  const isSignedIn = accountStore.isSignedIn;
  const accountId = accountStore.getAccountId();
  const empty = useMemo(() => {
    if (tokens?.length == 0) {
      return true;
    }
    return false;
  }, [tokens?.length]);
  function displayBalance(balance: string) {
    const result = isSignedIn
      ? 0 < Number(balance) && Number(balance) < 0.001
        ? "< 0.001"
        : toPrecision(String(balance), 3)
      : "-";
    return result;
  }
  function displayUSD(token: ITokenMetadata) {
    if (!accountId) return "";
    const p = Big(allTokenPrices?.[token.id]?.price || "0")
      .mul(token.balance || 0)
      .toFixed();
    return toInternationalCurrencySystem_usd(p);
  }
  function sortBy(tokenB: ITokenMetadata, tokenA: ITokenMetadata) {
    const tokenA_usd = Big(allTokenPrices?.[tokenA.id]?.price || 0).mul(
      tokenA.balance || 0
    );
    const tokenB_usd = Big(allTokenPrices?.[tokenB.id]?.price || 0).mul(
      tokenB.balance || 0
    );
    if (sort == "desc") {
      if (tokenA_usd.eq(0) && tokenB_usd.eq(0)) {
        return Big(tokenA.balance || 0)
          .minus(tokenB.balance || 0)
          .toNumber();
      } else {
        return tokenA_usd.minus(tokenB_usd).toNumber();
      }
    } else {
      if (tokenA_usd.eq(0) && tokenB_usd.eq(0)) {
        return Big(tokenB.balance || 0)
          .minus(tokenA.balance || 0)
          .toNumber();
      } else {
        return tokenB_usd.minus(tokenA_usd).toNumber();
      }
    }
  }
  function addToken() {
    setAddTokenLoading(true);
    registerTokenAndExchange(searchText).catch(() => {
      setAddTokenError(true);
      setAddTokenLoading(false);
    });
  }
  function addOrDeletCommonToken(token: ITokenMetadata) {
    const yes = isCollected(token);
    if (yes) {
      const new_common_tokens = common_tokens.filter(
        (t: TokenMetadata) => !(t.id == token.id && t.symbol == token.symbol)
      );
      tokenStore.set_common_tokens(new_common_tokens);
    } else {
      common_tokens.push(token);
      tokenStore.set_common_tokens(common_tokens);
    }
  }
  function isCollected(token: TokenMetadata) {
    const finded = common_tokens.find(
      (t: TokenMetadata) => t.id == token.id && t.symbol == token.symbol
    );
    return !!finded;
  }
  return (
    <div className={`${hidden ? "hidden" : ""}`}>
      {tokens?.sort(sortBy).map((token) => {
        return (
          <div
            className={`flexBetween hover:bg-gray-40 rounded-md pl-2 pr-1.5 cursor-pointer`}
            key={token.id + token.name}
            style={{ height: "46px" }}
            onClick={() => {
              onSelect(token);
              onRequestClose();
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center relative overflow-hidden rounded-full border border-gray-110"
                style={{
                  width: "26px",
                  height: "26px",
                }}
              >
                <img
                  className="flex-shrink-0"
                  src={token.icon || "/images/placeholder.svg"}
                  alt=""
                />
                {token.isRisk ? (
                  <span
                    className="italic text-white bg-black bg-opacity-70 absolute bottom-0"
                    style={{ width: "26px", height: "10px" }}
                  >
                    <label
                      className="text-sm block transform scale-50 relative font-extrabold"
                      style={{ top: "-5px", left: "-1px" }}
                    >
                      TKN
                    </label>
                  </span>
                ) : null}
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-white">{token.symbol}</span>
                  {token.isRisk ? <RiskIcon /> : null}
                </div>
                <span className="text-xs text-gray-60">
                  $
                  {toPrecision(
                    allTokenPrices[token.id]?.price || "0",
                    2,
                    false,
                    false
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-white">
              <div className="flex flex-col items-end">
                <span>{displayBalance(token.balance || "0")}</span>
                <span className="text-xs text-gray-60">
                  {displayUSD(token)}
                </span>
              </div>
              <CollectIcon
                onClick={(e: any) => {
                  e.stopPropagation();
                  addOrDeletCommonToken(token);
                }}
                className="cursor-pointer text-gray-60 relative top-1"
                collected={isCollected(token)}
              />
            </div>
          </div>
        );
      })}
      {empty ? (
        <div
          className="flex flex-col items-center justify-center"
          style={{ marginTop: "47px" }}
        >
          <EmptyIcon />
          <span
            className="text-sm text-gray-10"
            style={{ margin: "20px 0 8px 0" }}
          >
            No token found
          </span>
          {enableAddToken && isSignedIn ? (
            <div
              className="flex items-center justify-center bg-greenGradient rounded mt-4 text-black font-bold text-base cursor-pointer mb-5"
              style={{ height: "42px", width: "290px" }}
              onClick={addToken}
            >
              <ButtonTextWrapper
                loading={addTokenLoading}
                Text={() => <>Add Token</>}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
