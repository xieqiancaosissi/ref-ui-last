import Image from "next/image";
import SelectTokenModal from "../../components/common/SelectTokenModal/Index";
import { ArrowDownIcon } from "../../components/swap/icons";
import { useState } from "react";
import { ITokenMetadata } from "@/hooks/useBalanceTokens";

export default function SelectTokenButton(props: any) {
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
  }
  return (
    <div>
      <div
        className="flex items-center cursor-pointer flex-shrink-0"
        onClick={showModal}
      >
        <Image
          width="20"
          height="20"
          alt=""
          src={selectToken?.icon || ""}
          className="rounded-full"
        />
        <span className="text-white font-bold text-base ml-1.5 mr-2.5 ">
          {selectToken?.symbol}
        </span>
        <ArrowDownIcon className="text-gray-50" />
      </div>
      {isOpen ? (
        <SelectTokenModal
          isOpen={isOpen}
          onRequestClose={hideModal}
          onSelect={onSelect}
        />
      ) : null}
    </div>
  );
}
