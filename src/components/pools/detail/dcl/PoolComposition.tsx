import React from "react";
import tokenIcons from "@/utils/tokenIconConfig";
import { NearIcon } from "@/components/pools/icon";
import { toInternationalCurrencySystem } from "@/utils/numbers";
import { useRouter } from "next/router";
import { usePersistSwapStore } from "@/stores/swap";
import { getTokenUIId } from "@/services/swap/swapUtils";
import { TokenLinks } from "./tokenLinksConfig";
import { FiArrowUpRight } from "react-icons/fi";
import { openUrl } from "@/services/commonV3";
import HoverTooltip from "@/components/common/HoverToolTip";

export default function PoolComposition(props: any) {
  const { tokenPriceList, tokens } = props;
  const title = ["Pair", "Amount", "Price"];
  const persistSwapStore = usePersistSwapStore();
  const router = useRouter();
  const toSwap = (tokens: any) => {
    persistSwapStore.setTokenInId(getTokenUIId(tokens[0].meta));
    persistSwapStore.setTokenOutId(getTokenUIId(tokens[1].meta));
    router.push("/");
  };

  function TokenIconComponent({ ite }: { ite: any }) {
    const hasCustomIcon = Reflect.has(tokenIcons, ite.id);
    const isNearToken = ite.id === "wrap.near";
    const iconStyle = { width: "26px", height: "26px", borderRadius: "50%" };

    if (hasCustomIcon && !isNearToken) {
      return (
        <div className={`relative`}>
          <img src={tokenIcons[ite.id]} alt="" style={iconStyle} />
        </div>
      );
    }

    if (isNearToken) {
      return <NearIcon style={iconStyle} />;
    }

    return (
      <div>
        <img src={ite.icon} alt="" style={iconStyle} />
      </div>
    );
  }

  function displayAmount(amount: string) {
    if (+amount == 0) {
      return "0";
    } else if (+amount < 0.01) {
      return "< 0.01";
    } else {
      return toInternationalCurrencySystem(amount.toString(), 2);
    }
  }
  function displayTvl(token: any) {
    const { tvl } = token;
    if (+tvl == 0 && !tokenPriceList[token.meta.id]?.price) {
      return "$ -";
    } else if (+tvl == 0) {
      return "$0";
    } else if (+tvl < 0.01) {
      return "< $0.01";
    } else {
      return "$" + toInternationalCurrencySystem(tvl.toString(), 2);
    }
  }

  return (
    <div
      className="w-183 min-h-42 rounded-md p-4"
      style={{
        background: "rgba(33, 43, 53, 0.2)",
      }}
    >
      {/* title */}
      <div className="grid grid-cols-11">
        {title.map((item, index) => {
          return (
            <span
              className={`${
                index == 0 ? "col-span-5" : "col-span-3"
              } text-sm text-gray-60 font-normal`}
              key={item + "_" + index}
            >
              {item}
            </span>
          );
        })}
      </div>
      {/* pair */}
      <div>
        {tokens.map((item: any, index: number) => {
          return (
            <div
              className="grid grid-cols-11 my-3 hover:opacity-90"
              key={item.meta.id + index}
            >
              {/* token */}
              <div className="col-span-5 flex items-center">
                {TokenIconComponent({ ite: item.meta })}
                <div className="ml-3">
                  <h4 className="text-base text-white font-medium flex items-center">
                    {item.meta.symbol == "wNEAR" ? "NEAR" : item.meta.symbol}
                    {(TokenLinks as any)[item.meta.symbol] ? (
                      <HoverTooltip tooltipText={"AwesomeNear Verified Token"}>
                        <a
                          className=""
                          onClick={(e) => {
                            e.stopPropagation();
                            openUrl((TokenLinks as any)[item.meta.symbol]);
                          }}
                        >
                          <FiArrowUpRight className="text-primaryText hover:text-green-10 cursor-pointer" />
                        </a>
                        {/* <CustomTooltip id={"nearVerifiedId1" + i} /> */}
                      </HoverTooltip>
                    ) : null}
                  </h4>
                  <p
                    className="text-xs text-gray-60 underline cursor-pointer"
                    title={item.meta.id}
                    onClick={() => toSwap(tokens)}
                  >
                    {item.meta.id.length > 30
                      ? item.meta.id.substring(0, 30) + "..."
                      : item.meta.id}
                  </p>
                </div>
              </div>
              {/* amounts */}
              <div className="col-span-3 flex items-center text-sm text-white font-normal">
                {displayAmount(item.amount)}
              </div>
              {/* price */}
              <div className="col-span-3 flex items-center text-sm text-white font-normal">
                {displayTvl(item)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
