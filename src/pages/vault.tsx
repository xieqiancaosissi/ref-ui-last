import React from "react";
import ValutAssets from "@/components/vault/valutAssets";
import Tab from "@/components/vault/Tab";

export default function vault() {
  return (
    <div>
      {/* menu */}
      <ValutAssets />
      <div className="h-[186px] w-full xsm:hidden"></div>
      <Tab />
      {/* list */}
      <div className="lg:w-[1104px] xsm:w-full"></div>
    </div>
  );
}
