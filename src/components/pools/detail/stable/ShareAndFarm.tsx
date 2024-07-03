import React from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { StableFarmIcon } from "../../icon";
import HoverTip from "@/components/common/Tips";
export default function ShareAndFarm() {
  return (
    <div className="my-5 w-270 flex justify-between items-center">
      {/* left */}
      <div className="text-gray-60 text-sm font-normal flex">
        {/*  */}
        <div className="frcc">
          <HoverTip
            msg={"Shares available / Total shares"}
            extraStyles={"w-46"}
          />
          <span>Shares</span>
          <p className="ml-2">
            <span className="text-white">478</span> / <span>2456.09</span>
          </p>
        </div>

        <div className="frcc ml-10">
          <StableFarmIcon />
          <span className="text-white ml-1 mr-2">0.8%</span>
          <span>In</span>
          <span className=" underline cursor-pointer mx-1 hover:text-white">
            Classic Farms
          </span>
          <FiArrowUpRight className="hover:text-green-10" />
        </div>
      </div>
      {/* right liquidity button */}
      <div className="flex items-center justify-end">
        <div className="bg-primaryGreen text-black rounded w-32 h-7 opacity-90 frcc border border-transparent text-sm cursor-pointer hover:opacity-100">
          Add Liquidity
        </div>
        <div
          className="bg-transparent rounded w-36 h-7 frcc border opacity-90 border-gray-40 text-sm ml-2  cursor-pointer hover:opacity-100"
          style={{ color: "#BCC9D2" }}
        >
          Remove Liquidity
        </div>
      </div>
    </div>
  );
}
