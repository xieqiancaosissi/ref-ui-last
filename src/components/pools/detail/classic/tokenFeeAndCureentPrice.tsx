import React, { useState, useEffect } from "react";
import { SplitRectangleIcon, ExchangeIcon } from "@/components/pools/icon";
import { getAllTokenPrices } from "@/services/farm";

export default function TokenFeeAndCureentPrice({
  poolDetail,
  tokenPriceList,
}: {
  poolDetail: any;
  tokenPriceList: any;
}) {
  const [currentSort, setCurrenSort] = useState([0, 1]);

  const exchange = () => {
    const [a, b] = currentSort;
    setCurrenSort([b, a]);
  };
  //
  return (
    <div className="flex items-center text-white h-10 justify-around ml-9">
      <div className="text-sm">
        <h3 className="text-gray-50 font-normal">Fee</h3>
        <p>{poolDetail.total_fee * 100}%</p>
      </div>
      <SplitRectangleIcon className="mx-7" />
      <div className="text-sm min-w-45">
        <h3 className="text-gray-50 font-normal">Current Price</h3>
        <p>
          <span className="mr-1">1</span>
          {poolDetail.token_symbols[currentSort[0]] == "wNEAR"
            ? "NEAR"
            : poolDetail.token_symbols[currentSort[0]]}
          <span className="text-gray-50 font-normal">{`($${
            Math.ceil(
              tokenPriceList[poolDetail.token_account_ids[currentSort[0]]]
                .price * 100
            ) / 100
          })`}</span>
          <span className="mx-1">=</span>
          <span className="mr-1">
            {Math.ceil(
              (tokenPriceList[poolDetail.token_account_ids[currentSort[0]]]
                .price /
                tokenPriceList[poolDetail.token_account_ids[currentSort[1]]]
                  .price) *
                100
            ) / 100}
          </span>
          {poolDetail.token_symbols[currentSort[1]] == "wNEAR"
            ? "NEAR"
            : poolDetail.token_symbols[currentSort[1]]}
        </p>
      </div>
      <ExchangeIcon
        className="mt-auto ml-1 mb-1 cursor-pointer"
        onClick={() => exchange()}
      />
    </div>
  );
}
