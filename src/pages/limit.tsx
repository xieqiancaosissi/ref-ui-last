import { useEffect, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Big from "big.js";
import _ from "lodash";

export default function LimitOrderPage() {
  return (
    <main className="flex justify-center mt-6 gap-5">
      {/* charts and records container */}
      <div
        className="border border-gray-30 rounded-lg"
        style={{ width: "850px" }}
      ></div>
      {/* create order container */}
      <div className="" style={{ width: "420px" }}>
        <span className="font-bold text-xl bg-textWhiteGradient bg-clip-text text-transparent">
          Limit Order
        </span>
        <div className="rounded-lg bg-dark-10 p-3.5 mt-2"></div>
      </div>
    </main>
  );
}
// SSR
export function getServerSideProps(context: any) {
  return {
    props: {
      data: "testdata",
    },
  };
}
