import { useEffect, useState } from "react";
import { useAccountStore } from "../stores/account";
import dynamic from "next/dynamic";
import { getAccountNearBalance } from "../services/token";
import {
  RefreshIcon,
  SWitchButton,
  CheckboxIcon,
} from "../components/swap/icons";
import Input from "../components/swap/Input";
import SwapDetail from "../components/swap/SwapDetail";
import swapStyles from "../components/swap/swap.module.css";
const SwapButton = dynamic(() => import("../components/swap/SwapButton"), {
  ssr: false,
});
const SetPopup = dynamic(() => import("../components/swap/SetPopup"), {
  ssr: false,
});

export default function Swap(props: any) {
  const [highImpactCheck, setHighImpactCheck] = useState<boolean>(false);
  const accountStore = useAccountStore();
  const accountId = accountStore.getIsSignedIn();
  useEffect(() => {
    getNearMeta();
  }, [accountId]);
  async function getNearMeta() {
    const b = await getAccountNearBalance();
  }
  function onCheck() {
    setHighImpactCheck(!highImpactCheck);
  }
  return (
    <main className="m-auto my-20 select-none" style={{ width: "420px" }}>
      <div className="rounded-lg bg-dark-10 p-4">
        {/* set */}
        <div className="flex items-center justify-between">
          <span className="text-white font-bold text-xl">Swap</span>
          <div className="flex items-center gap-2 z-20">
            <span className={swapStyles.swapControlButton}>
              <RefreshIcon />
            </span>
            <SetPopup />
          </div>
        </div>
        {/* input part */}
        <div className="flex flex-col items-center mt-4">
          <Input />
          <div className="flex items-center justify-center rounded w-7 h-7 cursor-pointer text-gray-50 hover:text-white  bg-dark-60 hover:bg-dark-10 -my-3.5 relative z-10 border-2 border-dark-10">
            <SWitchButton />
          </div>
          <Input disabled={true} className="mt-0.5" />
        </div>
        {/* high price tip */}
        <div className="flexBetween rounded border border-red-10 border-opacity-45 bg-red-10 bg-opacity-10 text-xs text-red-10 p-2 mt-4">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center rounded-sm border border-red-10 cursor-pointer ${
                highImpactCheck ? "bg-red-10" : ""
              }`}
              style={{ width: "14px", height: "14px" }}
              onClick={onCheck}
            >
              <CheckboxIcon className={`${highImpactCheck ? "" : "hidden"}`} />
            </div>
            I accept the price impact
          </div>
          <span className="font-bold">-3% / -1.990 ABR</span>
        </div>
        {/* submit button */}
        <SwapButton />
      </div>
      {/* detail */}
      <SwapDetail />
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
