import React, { useEffect, useState } from "react";
import _ from "lodash";
import Big from "big.js";
import { CollectIcon } from "./Icons";
import { ITokenMetadata } from "../../../hooks/useBalanceTokens";
import { useAccountStore } from "../../../stores/account";
import { toPrecision } from "../../../utils/numbers";
type ISort = "asc" | "desc";
export default function Table({
  tokens,
  sort,
  hidden,
}: {
  tokens: ITokenMetadata[];
  sort: ISort;
  hidden: boolean;
}) {
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.isSignedIn;
  function displayBalance(balance: string) {
    const result = isSignedIn
      ? 0 < Number(balance) && Number(balance) < 0.001
        ? "< 0.001"
        : toPrecision(String(balance), 3)
      : "-";
    return result;
  }
  function sortBy(tokenB: ITokenMetadata, tokenA: ITokenMetadata) {
    if (sort == "desc") {
      return Big(tokenA.balance).minus(tokenB.balance).toNumber();
    } else {
      return Big(tokenB.balance).minus(tokenA.balance).toNumber();
    }
  }
  return (
    <>
      {tokens.sort(sortBy).map((token) => {
        return (
          <div
            className={`flexBetween hover:bg-gray-40 rounded-md p-2 cursor-pointer ${
              hidden ? "hidden" : ""
            }`}
            key={token.id + token.name}
            style={{ height: "42px" }}
          >
            <div className="flex items-center gap-2.5">
              <img
                className="rounded-full"
                src={token.icon || ""}
                style={{
                  width: "26px",
                  height: "26px",
                }}
              />
              <span className="text-sm text-white">{token.symbol}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white">
              <span>{displayBalance(token.balance)}</span>
              <CollectIcon
                className="cursor-pointer text-gray-60"
                // collected
              />
            </div>
          </div>
        );
      })}
    </>
  );
}
