import React from "react";
import { useLimitRateChartStore } from "@/stores/limitChart";
export default function ChartTab() {
  const limitChartStore = useLimitRateChartStore();
  const tab = limitChartStore.getChartTab();
  return (
    <div className="inline-flex items-center justify-between border border-gray-70 rounded p-1">
      <div
        onClick={() => {
          limitChartStore.setChartTab("PRICE");
        }}
        className={`flex items-center justify-center px-2 py-px rounded-sm text-sm cursor-pointer ${
          tab == "PRICE" ? "bg-gray-100 text-white" : "text-gray-60"
        }`}
      >
        Price
      </div>
      <div
        onClick={() => {
          limitChartStore.setChartTab("ORDER");
        }}
        className={`flex items-center justify-center px-2 py-px rounded-sm text-sm cursor-pointer ${
          tab == "ORDER" ? "bg-gray-100 text-white" : "text-gray-60"
        }`}
      >
        Orders
      </div>
    </div>
  );
}
