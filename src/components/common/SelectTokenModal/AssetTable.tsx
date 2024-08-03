import React, { useState, useContext, useMemo } from "react";
import _ from "lodash";
import { SolidArrowDownIcon } from "./Icons";
import Table from "./Table";
import { SelectTokenContext } from "./Context";
import { TokenMetadata } from "@/services/ft-contract";
import { useTokenStore, ITokenStore } from "@/stores/token";
import CustomTooltip from "@/components/customTooltip/customTooltip";
import { QuestionIcon } from "../Icons";
import { is_specific_suffix } from "@/utils/commonUtil";
export default function AssetTable() {
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [tab, setTab] = useState<"default" | "tkn" | "tknx" | "mc">("default");
  const tokenStore = useTokenStore() as ITokenStore;
  const defaultAccountTokens = tokenStore.getDefaultAccountTokens();
  const tknAccountTokens = tokenStore.getTknAccountTokens();
  const tknxAccountTokens = tokenStore.getTknxAccountTokens();
  const mcAccountTokens = tokenStore.getMcAccountTokens();
  const { searchText } = useContext(SelectTokenContext);
  const [
    defaultSearchResult,
    tknSearchResult,
    tknxSearchResult,
    mcSearchResult,
  ] = useMemo(() => {
    if (searchText) {
      const defaultSearchResult = defaultAccountTokens.data.filter(filterFun);
      const tknSearchResult = tknAccountTokens.data.filter(filterFun);
      const tknxSearchResult = tknxAccountTokens.data.filter(filterFun);
      const mcSearchResult = mcAccountTokens.data.filter(filterFun);
      return [
        defaultSearchResult,
        tknSearchResult,
        tknxSearchResult,
        mcSearchResult,
      ];
    } else {
      return [
        defaultAccountTokens.data,
        tknAccountTokens.data,
        tknxAccountTokens.data,
        mcAccountTokens.data,
      ];
    }
  }, [
    searchText,
    JSON.stringify(defaultAccountTokens || {}),
    JSON.stringify(tknAccountTokens || {}),
    JSON.stringify(tknxAccountTokens || {}),
    JSON.stringify(mcAccountTokens || {}),
  ]);
  function sortBalance() {
    if (sort == "asc") {
      setSort("desc");
    } else {
      setSort("asc");
    }
  }
  function filterFun(token: TokenMetadata) {
    const condition1 = token.symbol
      ?.toLocaleLowerCase()
      .includes(searchText.toLocaleLowerCase());
    const condition2 =
      token.id?.toLocaleLowerCase() == searchText.toLocaleLowerCase();
    return condition1 || condition2;
  }
  function tknTip() {
    return `
    <div class="text-gray-110 text-xs text-left break-all w-62">
    Created by any user on https://tkn.homes with the tkn.near suffix, poses high risks. Ref has not certified it. Exercise caution.
    </div>
    `;
  }
  function tknxTip() {
    return `
    <div class="text-gray-110 text-xs text-left break-all w-62">
        Created by any user on https://tkn.homes with the tknx.near suffix, poses high risks. Ref has not certified it. Exercise caution.
    </div>
    `;
  }
  function mcTip() {
    return `
    <div class="text-gray-110 text-xs text-left break-all w-62">
    Created by any user on https://meme.cooking/create with the meme-cooking.near suffix, poses high risks. Ref has not certified it. Exercise caution.
    </div>
    `;
  }
  return (
    <div className="mt-7">
      {/* title */}
      <div className="flexBetween text-sm text-gray-60">
        <div className="flex items-stretch border border-gray-100 rounded-md h-6 text-xs">
          <span
            className={`flexBetween cursor-pointer rounded-tl rounded-bl px-1.5 ${
              tab == "default" ? "bg-gray-100 text-white" : ""
            }`}
            onClick={() => {
              setTab("default");
            }}
          >
            Default
          </span>
          <div
            className={`flexBetween rounded-tr rounded-br gap-1 cursor-pointer px-1.5 ${
              tab == "tkn" ? "bg-gray-100 text-white" : ""
            }`}
            onClick={() => {
              setTab("tkn");
            }}
          >
            <span>TKN</span>
            <div
              className="text-white text-right"
              data-class="reactTip"
              data-tooltip-id="tknTipId"
              data-place="top"
              data-tooltip-html={tknTip()}
            >
              <QuestionIcon className="text-gray-60 hover:text-white" />
              <CustomTooltip id="tknTipId" />
            </div>
          </div>
          <div
            className={`flexBetween rounded-tr rounded-br gap-1 cursor-pointer px-1.5 ${
              tab == "tknx" ? "bg-gray-100 text-white" : ""
            }`}
            onClick={() => {
              setTab("tknx");
            }}
          >
            <span>TKNX</span>
            <div
              className="text-white text-right"
              data-class="reactTip"
              data-tooltip-id="tknxTipId"
              data-place="top"
              data-tooltip-html={tknxTip()}
            >
              <QuestionIcon className="text-gray-60 hover:text-white" />
              <CustomTooltip id="tknxTipId" />
            </div>
          </div>
          <div
            className={`flexBetween rounded-tr rounded-br gap-1 cursor-pointer px-1.5 ${
              tab == "mc" ? "bg-gray-100 text-white" : ""
            }`}
            onClick={() => {
              setTab("mc");
            }}
          >
            <span>MC</span>
            <div
              className="text-white text-right"
              data-class="reactTip"
              data-tooltip-id="mcTipId"
              data-place="top"
              data-tooltip-html={mcTip()}
            >
              <QuestionIcon className="text-gray-60 hover:text-white" />
              <CustomTooltip id="mcTipId" />
            </div>
          </div>
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
          displayTokens={defaultSearchResult}
          loading={!defaultAccountTokens.done}
          sort={sort}
          enableAddToken
          hidden={tab !== "default"}
        />
        {/* TKN */}
        <Table
          displayTokens={tknSearchResult}
          loading={!tknAccountTokens.done}
          sort={sort}
          hidden={tab !== "tkn"}
        />
        <Table
          displayTokens={tknxSearchResult}
          loading={!tknxAccountTokens.done}
          sort={sort}
          hidden={tab !== "tknx"}
        />
        <Table
          displayTokens={mcSearchResult}
          loading={!mcAccountTokens.done}
          sort={sort}
          hidden={tab !== "mc"}
        />
      </div>
    </div>
  );
}
