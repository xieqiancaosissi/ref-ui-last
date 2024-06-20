import React, { useContext, useMemo, useState } from "react";
import _ from "lodash";
import Big from "big.js";
import Image from "next/image";
import { CollectIcon, EmptyIcon } from "./Icons";
import { ITokenMetadata } from "../../../hooks/useBalanceTokens";
import { useAccountStore } from "../../../stores/account";
import { toPrecision } from "../../../utils/numbers";
import { ButtonTextWrapper } from "../Button";
import { useTokenStore } from "../../../stores/token";
import { SelectTokenContext } from "./Context";
import { TokenMetadata } from "@/services/ft-contract";
type ISort = "asc" | "desc";
export default function Table({
  tokens,
  sort,
  hidden,
  tokensLoading,
  enableAddToken,
}: {
  tokens: ITokenMetadata[];
  sort: ISort;
  hidden: boolean;
  tokensLoading: boolean;
  enableAddToken?: boolean;
}) {
  const [addTokenLoading, setAddTokenLoading] = useState<boolean>(false);
  const { onSelect, onRequestClose } = useContext(SelectTokenContext);
  const tokenStore: any = useTokenStore();
  const common_tokens = tokenStore.get_common_tokens();
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.isSignedIn;
  const empty = useMemo(() => {
    if (!tokensLoading && tokens.length == 0) {
      return true;
    }
    return false;
  }, [tokensLoading, tokens]);
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
      return Big(tokenA.balance || 0)
        .minus(tokenB.balance || 0)
        .toNumber();
    } else {
      return Big(tokenB.balance || 0)
        .minus(tokenA.balance || 0)
        .toNumber();
    }
  }
  function addToken() {
    setAddTokenLoading(true);
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
      {tokens.sort(sortBy).map((token) => {
        return (
          <div
            className={`flexBetween hover:bg-gray-40 rounded-md pl-2 pr-1.5 cursor-pointer`}
            key={token.id + token.name}
            style={{ height: "42px" }}
            onClick={() => {
              onSelect(token);
              onRequestClose();
            }}
          >
            <div className="flex items-center gap-2.5">
              <Image
                width="26"
                height="26"
                className="rounded-full border border-gray-110 flex-shrink-0"
                style={{
                  width: "26px",
                  height: "26px",
                }}
                src={token.icon || "/images/placeholder.svg"}
                alt=""
              />
              <span className="text-sm text-white">{token.symbol}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white">
              <span>{displayBalance(token.balance || "0")}</span>
              <CollectIcon
                onClick={(e: any) => {
                  e.stopPropagation();
                  addOrDeletCommonToken(token);
                }}
                className="cursor-pointer text-gray-60"
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
          {enableAddToken ? (
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
