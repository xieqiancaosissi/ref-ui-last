import React, { useState, useEffect } from "react";
import SelectTokenModal from "@/components/common/SelectTokenModal/Index";
import { ArrowDownIcon } from "@/components/swap/icons";
import { ITokenMetadata } from "@/interfaces/tokens";
import HoverTooltip from "@/components/common/HoverToolTip";
import { MobileArrowUp } from "../../icon";
export default function PoolInput({
  title,
  index,
  handleToken,
}: {
  title?: string;
  index: number;
  handleToken: (e: any) => void;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectToken, setSelectToken] = useState<ITokenMetadata>();
  function showModal() {
    setIsOpen(true);
  }
  function hideModal() {
    setIsOpen(false);
  }
  function onSelect(token: ITokenMetadata) {
    console.log(token, "token");
    setSelectToken(token);
    // notice farther
    handleToken({
      index,
      value: token?.id,
    });
  }
  return (
    <>
      <div
        className="flex flex-col items-start lg:w-48 xsm:w-full mb-2"
        onClick={showModal}
      >
        <h2 className="text-gray-50 text-sm font-normal mb-3">{title}</h2>
        <div className="w-full h-16 rounded bg-dark-60 flex items-center justify-between border border-transparent px-4 hover:border-green-10">
          <div className="lg:w-35 xsm:w-full frcc">
            {selectToken?.icon ? (
              <img
                src={selectToken?.icon}
                alt=""
                className="lg:w-6 lg:h-6 xsm:w-9 xsm:h-9 rounded-full"
              />
            ) : (
              <div className="lg:w-6 lg:h-6 xsm:w-9 xsm:h-9 rounded-full bg-dark-40 shrink-0"></div>
            )}
            <div className="text-base font-medium text-white ml-2 w-full">
              {selectToken && selectToken?.symbol?.length > 11 ? (
                <HoverTooltip tooltipText={selectToken?.symbol}>
                  {selectToken?.symbol.substring(0, 10) + "..."}
                </HoverTooltip>
              ) : (
                selectToken?.symbol
              )}
            </div>
          </div>
          <ArrowDownIcon className={"text-gray-50 xsm:hidden"} />
          <MobileArrowUp className={"lg:hidden"} />
        </div>
      </div>
      <SelectTokenModal
        isOpen={isOpen}
        onRequestClose={hideModal}
        onSelect={onSelect}
        filterToken={["wNEAR"]}
      />
    </>
  );
}
