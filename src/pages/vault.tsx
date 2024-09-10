import React from "react";
import ValutAssets from "@/components/vault/valutAssets";

export default function vault() {
  return (
    <div>
      {/* menu */}
      <ValutAssets />
      <div className="h-[200px] w-full xsm:hidden"></div>
      {/* list */}
      <div className="lg:w-[1104px] xsm:w-full"></div>
    </div>
  );
}
