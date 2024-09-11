import React, { useEffect } from "react";
import { vaultConfig, VaultColorConfig } from "./vaultConfig";
import { openUrl } from "@/services/commonV3";
import { useRouter } from "next/router";
import { getSearchResult } from "@/services/pool";

export default function VaultList(props: any) {
  //api.ref.finance/pool/search?type=classic&sort=apy&limit=20&labels=&offset=0&hide_low_pool=true&order_by=desc&token_type=&token_list=&pool_id_list=

  const { currentTag } = props;
  const router = useRouter();
  const blink = (params: any) => {
    if (params?.path) {
      router.push(params.path);
    }
    if (params?.url) {
      openUrl(params.url);
    }
  };

  const getRes = async (poolType: string) => {
    const res = await getSearchResult({
      type: poolType,
      sort: "apy",
      limit: "20",
      offset: "0",
      hide_low_pool: true,
      order: "desc",
      token_type: "",
      token_list: "",
      pool_id_list: "",
      onlyUseId: false,
      labels: "", //all | farm | new | meme | other
    });
    console.log(res);
  };

  useEffect(() => {
    getRes("classic");
    getRes("stable");
    getRes("dcl");
  }, []);
  return (
    <div
      className={`vlg:flex vlg:items-center vlg:flex-wrap vlg:w-[1104px] xsm:w-full xsm:px-[12px]`}
    >
      {vaultConfig().map((item: any, index: any) => {
        if (currentTag != "All" && item.category != currentTag) return null;
        return (
          <div
            key={"VaultList" + index}
            className={`vlg:mr-[30px] cursor-pointer vlg:hover:shadow-green-10 vlg:hover:shadow-sm vlg:w-[334px] vxsm:w-full xsm:my-[15px] rounded-lg bg-dark-290 border border-gray-90 p-[20px] h-[159px] vlg:mb-[30px] flex flex-col justify-between`}
            onClick={() => blink(item)}
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
