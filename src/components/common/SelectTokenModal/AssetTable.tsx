import React, { useState } from "react";
import _ from "lodash";
import { SolidArrowDownIcon } from "./Icons";
import { useSelectTokens } from "../../../hooks/useSelectTokens";
import {
  useDefaultBalanceTokens,
  useAutoBalanceTokens,
} from "../../../hooks/useBalanceTokens";
import Table from "./Table";
export default function AssetTable() {
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [tab, setTab] = useState<"default" | "tkn">("default");
  const { defaultList = [], autoList = [] } = useSelectTokens();
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
