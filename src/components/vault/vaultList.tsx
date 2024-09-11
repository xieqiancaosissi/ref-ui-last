import React from "react";
import { vaultConfig, VaultColorConfig } from "./vaultConfig";

export default function VaultList(props: any) {
  const { currentTag } = props;
  return (
    <div
      className={`vlg:flex vlg:items-center vlg:flex-wrap vlg:w-[1104px] xsm:w-full xsm:px-[20px]`}
    >
      {vaultConfig().map((item: any, index: any) => {
        if (currentTag != "All" && item.category != currentTag) return null;
        return (
          <div
            key={"VaultList" + index}
            className={`vlg:mr-[30px] cursor-pointer vlg:hover:shadow-green-10 vlg:hover:shadow-sm vlg:w-[334px] vxsm:w-full xsm:my-[15px] rounded-lg bg-dark-290 border border-gray-90 p-[20px] h-[159px] vlg:mb-[30px] flex flex-col justify-between`}
          >
            <div className="flex items-center">
              <div className="w-[38px] h-[38px]">{item.icon}</div>
              <div className="ml-[12px]">
                <p className="text-lg"> {item.title}</p>
                <span
                  className={`italic text-xs px-[12px] py-[2px] rounded-[14px] font-medium ${VaultColorConfig(
                    item.category
                  )}`}
                >
                  {item.category}
                </span>
              </div>
            </div>
            <div className="text-sm">
              <p className="flex items-center justify-between">
                <span className="text-gray-60"> {item.aprName}</span>
                <span>{item.aprValue}</span>
              </p>
              <p className="flex items-center justify-between mt-[14px]">
                <span className="text-gray-60">Risk Level </span>
                <span>{item.riskLevel}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
