import React, { useEffect, useState } from "react";
import _ from "lodash";
import { SolidArrowDownIcon } from "./Icons";
import { useSelectTokens } from "../../../hooks/useSelectTokens";
import {
  useBalanceTokens,
  ITokenMetadata,
} from "../../../hooks/useBalanceTokens";
import { useTokenStore } from "../../../stores/token";
import Table from "./Table";
import { TokenMetadata } from "@/services/ft-contract";
export default function AssetTable() {
  const { defaultList = [], autoList = [] } = useSelectTokens();
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [tab, setTab] = useState<"default" | "tkn">("default");
  const defaultDisplayTokens = useDefaultBalanceTokens(defaultList);
  const autoDisplayTokens = useAutoBalanceTokens(autoList);

  function sortBalance() {
    if (sort == "asc") {
      setSort("desc");
    } else {
      setSort("asc");
    }
  }
  return (
    <div className="mt-7">
      {/* title */}
      <div className="flexBetween text-sm text-gray-60">
        <div className="flex items-center gap-2">
          <span
            className="cursor-pointer"
            onClick={() => {
              setTab("default");
            }}
          >
            Default
          </span>
          <span
            className="flex items-center gap-1.5 cursor-pointer"
            onClick={() => {
              setTab("tkn");
            }}
          >
            TKN
          </span>
        </div>
        <div
          className="flex items-center gap-1.5 cursor-pointer"
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
          tokens={defaultDisplayTokens}
          sort={sort}
          hidden={tab !== "default"}
        />
        {/* TKN */}
        <Table tokens={autoDisplayTokens} sort={sort} hidden={tab !== "tkn"} />
      </div>
    </div>
  );
}

function useDefaultBalanceTokens(defaultList: TokenMetadata[]) {
  const [list, setList] = useState<ITokenMetadata[]>([]);
  const tokenStore = useTokenStore();
  const defaultAccountBalancesStore = tokenStore.getDefaultAccountBalances();
  const defaultAccountBalancesServer = useBalanceTokens(defaultList);
  useEffect(() => {
    if (defaultAccountBalancesStore.length > 0) {
      setList(defaultAccountBalancesStore);
    }
    if (defaultAccountBalancesServer.length > 0) {
      setList(defaultAccountBalancesServer);
      tokenStore.setDefaultAccountBalances(defaultAccountBalancesServer);
    }
  }, [defaultAccountBalancesStore, defaultAccountBalancesServer]);
  return list;
}
function useAutoBalanceTokens(autoList: TokenMetadata[]) {
  const [list, setList] = useState<ITokenMetadata[]>([]);
  const tokenStore = useTokenStore();
  const autoAccountBalancesStore = tokenStore.getAutoAccountBalances();
  const autoAccountBalancesServer = useBalanceTokens(autoList);
  useEffect(() => {
    if (autoAccountBalancesStore.length > 0) {
      setList(autoAccountBalancesStore);
    }
    if (autoAccountBalancesServer.length > 0) {
      setList(autoAccountBalancesServer);
      tokenStore.setAutoAccountBalances(autoAccountBalancesServer);
    }
  }, [autoAccountBalancesStore, autoAccountBalancesServer]);
  return list;
}
