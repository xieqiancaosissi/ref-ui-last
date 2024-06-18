import React, { useState, useEffect } from "react";
import SelectTokenModal from "@/components/common/SelectTokenModal/Index";
import { ArrowDownIcon } from "@/components/swap/icons";
import { ITokenMetadata } from "@/hooks/useBalanceTokens";

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
          <div className="frcc">
            <img
              src={selectToken?.icon}
              alt=""
              className="w-6 h-6 rounded-full"
            />
            <span className="text-base font-medium text-white ml-2">
              {selectToken?.symbol}
            </span>
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
