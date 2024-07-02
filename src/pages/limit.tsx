import { useEffect, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Big from "big.js";
import _ from "lodash";
import Input from "@/components/limit/Input";
import { SwitchIcon } from "@/components/limit/icons";
const CreateOrderButton = dynamic(
  () => import("@/components/limit/CreateOrderButton"),
  { ssr: false }
);
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
        <div className="rounded-lg bg-dark-10 p-3.5 mt-2">
          <span className="text-sm text-gray-50">Selling</span>
          <Input className="mt-2.5" />
          <div
            className="flex items-stretch gap-0.5 mt-0.5"
            style={{ height: "88px" }}
          >
            <div className="bg-dark-60 rounded w-2/3"></div>
            <div className="bg-dark-60 rounded flex-grow"></div>
          </div>
          <div
            className="flex items-center justify-center rounded border border-gray-50 border-opacity-20 cursor-pointer text-gray-50 hover:text-white my-4"
            style={{ height: "30px" }}
          >
            <SwitchIcon />
          </div>
          <span className="text-sm text-gray-50">Buying</span>
          <Input className="mt-2.5" />
          <CreateOrderButton />
        </div>
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
