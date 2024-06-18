import React, { useEffect, useState } from "react";
import Tips from "@/components/common/Tips/index";
import poolStyle from "./index.module.css";
import { feeList, bankList } from "./config";
export default function Fee({ getherFee }: { getherFee: (e: any) => void }) {
  const [isActive, setActive] = useState(0.3);
  const [feeValue, setFeeValue] = useState(isActive);
  const inputChange = (e: any) => {
    if (e.target.value >= 20) {
      setFeeValue(20);
    } else {
      setFeeValue(e.target.value);
    }
    setActive(e.target.value);
  };

  useEffect(() => {
    getherFee(feeValue);
  }, [feeValue]);
  return (
    <>
      <div className="flex items-center justify-between mt-4">
        {/*  */}
        <span className="frcc text-gray-60 font-normal text-sm">
          Total fee{" "}
          <Tips msg={`LP Tokens: 80% | Share: 20%`} extraStyles={"w-44"} />
        </span>

        {/*  */}
        <div className="frcc">
          <div className={`frcc w-38 text-sm py-1  ${poolStyle.commonStyle}`}>
            {feeList.map((item, index) => {
              return (
                <div
                  key={item.key + index}
                  className={`
                  ${
                    isActive == item.key
                      ? "text-white bg-gray-120 rounded"
                      : "text-gray-60"
                  }
                  w-12 h-5 frcc cursor-pointer
                `}
                  onClick={() => {
                    setActive(item.key);
                    setFeeValue(item.key);
                  }}
                >
                  {item.value}%
                </div>
              );
            })}
          </div>
          <div className={poolStyle.filterSeacrhInputContainer}>
            <input
              type="number"
              className={poolStyle.filterSearchInput}
              value={feeValue}
              onChange={inputChange}
            />
            <span className="text-gray-50 text-sm">%</span>
          </div>
        </div>
      </div>

      {/*  */}
      <div
        className={`w-100 h-20 p-4 mt-9 text-xs font-normal justify-between flex flex-col ${poolStyle.commonStyle}`}
      >
        {bankList.map((item, index) => {
          return (
            <p
              className="flex justify-between items-center"
              key={item.title + index}
            >
              <span className="text-gray-50">{item.title}</span>
              <span className="text-white">
                {(feeValue * item.rate).toFixed(2)}%
              </span>
            </p>
          );
        })}
      </div>
    </>
  );
}
