import React from "react";
import { NoContentIcon } from "@/components/pools/icon";

export default function NoContent() {
  return (
    <div className="fccc h-100 select-none">
      <NoContentIcon />
      <div className="text-lg font-normal text-gray-60 mt-5">{`There’s No content`}</div>
    </div>
  );
}
