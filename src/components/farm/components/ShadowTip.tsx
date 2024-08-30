import React, { useState, useContext } from "react";
import { useEffect } from "react";
import { FarmsContextData } from "./FarmsContext";
import { stake_boost_shadow } from "@/services/farm";

export default function ShadowTip({
  show,
  seed_id,
  className,
  user_unclaimed_map,
}: {
  show: boolean;
  seed_id: string;
  className?: string;
  user_unclaimed_map?: any;
}) {
  const contextData = useContext(FarmsContextData);
  const [amount, setAmount] = useState("0");
  useEffect(() => {
    const { free_amount } =
      contextData?.user_data?.user_seeds_map?.[seed_id] || {};
    setAmount(free_amount || "0");
  }, [contextData]);
  function formatCheckedList(data) {
    const formattedData = {};
    for (const [key, value] of Object.entries(data)) {
      formattedData[key] = { value: value.toString() };
    }
    return formattedData;
  }
  const formattedCheckedList = formatCheckedList(user_unclaimed_map[seed_id]);
  function activeShadow() {
    stake_boost_shadow({
      pool_id: +seed_id.split("@")[1],
      amount: "0",
      amountByTransferInFarm: amount,
      seed_id,
      checkedList: formattedCheckedList,
    });
  }
  if (!show) return null;
  return (
    <div
      className={`absolute -top-16 text-xs text-farmText w-56 border border-gray-80 rounded-md px-2 py-1 bg-gray-30 z-10 ${
        className ? className : ""
      }`}
    >
      <a
        className="text-xs ml-0.5 text-primaryGreen underline cursor-pointer"
        onClick={activeShadow}
      >
        Activating
      </a>{" "}
      this feature will automatically claim your Farming rewards.
    </div>
  );
}
