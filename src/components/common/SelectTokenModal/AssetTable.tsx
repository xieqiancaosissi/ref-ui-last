import React, { useState, useContext } from "react";
import { useDebounce } from "react-use";
import _ from "lodash";
import { SolidArrowDownIcon } from "./Icons";
import { useSelectTokens } from "../../../hooks/useSelectTokens";
import {
  useDefaultBalanceTokens,
  useAutoBalanceTokens,
  ITokenMetadata,
} from "../../../hooks/useBalanceTokens";
import Table from "./Table";
import { SelectTokenContext } from "./Context";
import { TokenMetadata } from "@/services/ft-contract";
export default function AssetTable() {
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [tab, setTab] = useState<"default" | "tkn">("default");
  const { defaultList = [], autoList = [], tokensLoading } = useSelectTokens();
  const [defaultSearchResult, setDefaultSearchResult] = useState<
    ITokenMetadata[]
  >([]);
  const [autoSearchResult, setAutoSearchResult] = useState<ITokenMetadata[]>(
    []
  );
  const defaultDisplayTokens = useDefaultBalanceTokens(defaultList);
  const autoDisplayTokens = useAutoBalanceTokens(autoList);
  const { searchText } = useContext(SelectTokenContext);
  useDebounce(
    () => {
      if (searchText) {
        const defaultSearchResult = defaultDisplayTokens.filter(filterFun);
        const autoSearchResult = autoDisplayTokens.filter(filterFun);
        setDefaultSearchResult(defaultSearchResult);
        setAutoSearchResult(autoSearchResult);
      } else {
        setDefaultSearchResult([]);
        setAutoSearchResult([]);
      }
    },
    0,
    [searchText, defaultDisplayTokens, autoDisplayTokens]
  );
  function sortBalance() {
    if (sort == "asc") {
      setSort("desc");
    } else {
      setSort("asc");
    }
  }
  function filterFun(token: TokenMetadata) {
    const condition1 = token.symbol
      .toLocaleLowerCase()
      .includes(searchText.toLocaleLowerCase());
    const condition2 =
      token.id.toLocaleLowerCase() == searchText.toLocaleLowerCase();
    return condition1 || condition2;
  }
  return (
    <div className="mt-7">
      {/* title */}
      <div className="flexBetween text-sm text-gray-60">
        <div className="flex items-stretch border border-gray-100 rounded-md h-6 text-xs">
          <span
            className={`flexBetween cursor-pointer rounded-tl rounded-bl px-1.5 ${
              tab == "default" ? "bg-gray-100" : ""
            }`}
            onClick={() => {
              setTab("default");
            }}
          >
            Default
          </span>
          <span
            className={`flexBetween rounded-tr rounded-br gap-1.5 cursor-pointer px-1.5 ${
              tab == "tkn" ? "bg-gray-100" : ""
            }`}
            onClick={() => {
              setTab("tkn");
            }}
          >
            TKN
          </span>
        </div>
        <div
          className="flex items-center gap-1.5 cursor-pointer pr-2"
          onClick={sortBalance}
        >
          <span>Balance</span>
          <SolidArrowDownIcon
            className={`${sort === "desc" ? "" : "transform rotate-180"}`}
          />
        </div>
      </div>
      <div className={`flex flex-col gap-1 mt-2`}>
        {/* Default */}
        <Table
          tokensLoading={tokensLoading}
          tokens={searchText ? defaultSearchResult : defaultDisplayTokens}
          sort={sort}
          enableAddToken
          hidden={tab !== "default"}
        />
        {/* TKN */}
        <Table
          tokensLoading={tokensLoading}
          tokens={searchText ? autoSearchResult : autoDisplayTokens}
          sort={sort}
          hidden={tab !== "tkn"}
        />
      </div>
    </div>
  );
}
