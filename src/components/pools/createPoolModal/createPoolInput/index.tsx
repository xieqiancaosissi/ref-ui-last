import React, { useState, useEffect } from "react";
import SelectTokenModal from "@/components/common/SelectTokenModal/Index";
import { ArrowDownIcon } from "@/components/swap/icons";
import { ITokenMetadata } from "@/hooks/useBalanceTokens";
import HoverTooltip from "@/components/common/HoverToolTip";
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
      <div className="flex flex-col items-start w-48 mb-2" onClick={showModal}>
        <h2 className="text-gray-50 text-sm font-normal mb-3">{title}</h2>
        <div className="w-full h-16 rounded bg-dark-60 flex items-center justify-between border border-transparent px-4 hover:border-green-10">
          <div className="w-80 frcc">
            {selectToken?.icon ? (
              <img
                src={selectToken?.icon}
                alt=""
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-dark-40 shrink-0"></div>
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
          <ArrowDownIcon className={"text-gray-50"} />
        </div>
      </div>
      <SelectTokenModal
        isOpen={isOpen}
        onRequestClose={hideModal}
        onSelect={onSelect}
      />
    </>
  );
}
