import React, { useState, useEffect, useContext, useMemo } from "react";
import { PortfolioContextType, PortfolioData } from "../RefPanelModal";
import { UpDownButton, useTotalLiquidityData } from "../Tool";
import { useAccountStore } from "@/stores/account";
import { getAccountId } from "@/utils/wallet";
import { YourLiquidityV2 } from "./YourLiquidityV2";
import { YourLiquidityV1 } from "./YourLiquidityV1";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

export default function Positions(props: any) {
  const {
    setYourLpValueV2,
    setYourLpValueV1,
    setLpValueV1Done,
    setLpValueV2Done,
    v1LiquidityQuantity,
    v2LiquidityQuantity,
    setV1LiquidityQuantity,
    setV2LiquidityQuantity,
    setV2LiquidityLoadingDone,
    setV1LiquidityLoadingDone,
    v1LiquidityLoadingDone,
    v2LiquidityLoadingDone,
    YourLpValueV1,
    YourLpValueV2,
    lpValueV1Done,
    lpValueV2Done,
    activeTab,
    setActiveTab,
  } = useContext(PortfolioData) as PortfolioContextType;
  const { total_liquidity_value, total_liquidity_quantity } =
    useTotalLiquidityData({
      YourLpValueV1,
      YourLpValueV2,
      lpValueV1Done,
      lpValueV2Done,
      v1LiquidityQuantity,
      v2LiquidityQuantity,
      v1LiquidityLoadingDone,
      v2LiquidityLoadingDone,
    });
  const accountStore = useAccountStore();
  const accountId = getAccountId();
  const isSignedIn = !!accountId || accountStore.isSignedIn;
  const total_quantity = +v1LiquidityQuantity + +v2LiquidityQuantity;
  const loading_status =
    !(v1LiquidityLoadingDone && v2LiquidityLoadingDone) && isSignedIn;
  const noData_status =
    !loading_status &&
    ((v1LiquidityLoadingDone &&
      v2LiquidityLoadingDone &&
      total_quantity == 0) ||
      !isSignedIn);
  const data_status =
    v1LiquidityLoadingDone && v2LiquidityLoadingDone && total_quantity > 0;

  const [poolType, setPoolType] = useState("dcl");
  return (
    <div className="text-white">
      <div className="flex mt-4 mb-12 cursor-pointer select-none">
        <div
          className={`p-2 h-6 text-sm font-medium frcc rounded ${
            poolType == "dcl"
              ? "text-white bg-gray-40"
              : "text-gray-60 bg-dark-10"
          }`}
          onClick={() => {
            setPoolType("dcl");
          }}
        >
          {`DCL (${v2LiquidityQuantity})`}
        </div>
        <div
          className={`p-2 ml-2 h-6 text-sm font-medium frcc rounded ${
            poolType == "classic"
              ? "text-white bg-gray-40"
              : "text-gray-60 bg-dark-10"
          }`}
          onClick={() => {
            setPoolType("classic");
          }}
        >
          {`Classic (${v1LiquidityQuantity})`}
        </div>
      </div>
      <div className="xsm:border-b xsm:border-cardBg">
        {/* liquidities list */}
        <div
          className={`${activeTab == "1" && poolType == "dcl" ? "" : "hidden"}`}
        >
          <YourLiquidityV2
            setYourLpValueV2={setYourLpValueV2}
            setLpValueV2Done={setLpValueV2Done}
            setLiquidityLoadingDone={setV2LiquidityLoadingDone}
            setLiquidityQuantity={setV2LiquidityQuantity}
          />
        </div>
        <div
          className={`${
            activeTab == "1" && poolType == "classic" ? "" : "hidden"
          }`}
        >
          <YourLiquidityV1
            setLpValueV1Done={setLpValueV1Done}
            setYourLpValueV1={setYourLpValueV1}
            setLiquidityLoadingDone={setV1LiquidityLoadingDone}
            setLiquidityQuantity={setV1LiquidityQuantity}
          />
        </div>
      </div>
      {/* pc loading */}
      {loading_status || noData_status ? (
        <SkeletonTheme
          baseColor="rgba(33, 43, 53, 0.3)"
          highlightColor="#2A3643"
        >
          <Skeleton
            style={{ width: "100%" }}
            height={40}
            count={4}
            className="mt-4"
          />
        </SkeletonTheme>
      ) : null}
    </div>
  );
}
